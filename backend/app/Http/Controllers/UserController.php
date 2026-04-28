<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => User::query()->orderBy('name')->get()->map(fn (User $user) => $this->present($user)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->rules());

        $user = User::query()->create([
            'username' => $validated['username'],
            'name' => $validated['fullName'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'status' => 'Active',
            'is_temp_password' => false,
        ]);

        return response()->json(['data' => $this->present($user)], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'fullName' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::in(['Cashier', 'Supervisor', 'Administrator'])],
            'status' => ['sometimes', Rule::in(['Active', 'Inactive'])],
        ]);

        $this->guardLastActiveAdmin($user, $validated);

        $user->update([
            'name' => $validated['fullName'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'status' => $validated['status'] ?? $user->status,
        ]);

        return response()->json(['data' => $this->present($user->fresh())]);
    }

    public function resetPassword(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'mode' => ['required', Rule::in(['temporary', 'manual'])],
            'password' => ['required_if:mode,manual', 'nullable', 'string', 'min:8'],
        ]);

        $isTemporary = $validated['mode'] === 'temporary';
        $password = $isTemporary
            ? 'Tmp@'.substr(str_shuffle('abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 6).'1'
            : $validated['password'];

        $user->update([
            'password' => Hash::make($password),
            'is_temp_password' => $isTemporary,
        ]);

        return response()->json([
            'data' => $this->present($user->fresh()),
            'temporaryPassword' => $isTemporary ? $password : null,
        ]);
    }

    private function rules(): array
    {
        return [
            'fullName' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:100', Rule::unique('users', 'username')],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['Cashier', 'Supervisor', 'Administrator'])],
        ];
    }

    private function guardLastActiveAdmin(User $user, array $validated): void
    {
        $wouldDeactivate = ($validated['status'] ?? $user->status) !== 'Active';
        $wouldDemote = $validated['role'] !== 'Administrator';

        if ($user->role === 'Administrator' && ($wouldDeactivate || $wouldDemote)) {
            $activeAdmins = User::query()
                ->where('role', 'Administrator')
                ->where('status', 'Active')
                ->count();

            if ($activeAdmins <= 1) {
                throw ValidationException::withMessages([
                    'role' => ['Cannot remove the only active administrator.'],
                ]);
            }
        }
    }

    private function present(User $user): array
    {
        return [
            'id' => $user->id,
            'username' => $user->username ?: $user->email,
            'fullName' => $user->name,
            'email' => $user->email,
            'role' => $user->role ?? 'Cashier',
            'status' => $user->status ?? 'Active',
            'isTempPassword' => (bool) ($user->is_temp_password ?? false),
            'createdAt' => optional($user->created_at)->toISOString(),
            'updatedAt' => optional($user->updated_at)->toISOString(),
        ];
    }
}
