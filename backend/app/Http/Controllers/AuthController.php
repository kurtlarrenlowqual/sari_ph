<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);

        return response()->json($user);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()
            ->where('username', $validated['username'])
            ->orWhere('email', $validated['username'])
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Invalid username or password.'],
            ]);
        }

        if (($user->status ?? 'Active') !== 'Active') {
            throw ValidationException::withMessages([
                'username' => ['This account is inactive.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $this->presentUser($user),
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        return response()->json($this->presentUser($request->user()));
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = $request->user();
        $user->update([
            'password' => Hash::make($validated['password']),
            'is_temp_password' => false,
        ]);

        return response()->json([
            'user' => $this->presentUser($user->fresh()),
        ]);
    }

    private function presentUser(User $user): array
    {
        return [
            'id' => $user->id,
            'username' => $user->username ?: $user->email,
            'fullName' => $user->name,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role ?? 'Cashier',
            'status' => $user->status ?? 'Active',
            'isTempPassword' => (bool) ($user->is_temp_password ?? false),
            'createdAt' => optional($user->created_at)->toISOString(),
            'updatedAt' => optional($user->updated_at)->toISOString(),
        ];
    }
}
