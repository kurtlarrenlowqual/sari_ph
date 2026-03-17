import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "sari_ph_pos_state_v2";

const DISCOUNT_RULES = {
  NONE: { label: "None", rate: 0 },
  SENIOR_CITIZEN: { label: "Senior Citizen", rate: 0.2 },
  PWD: { label: "PWD", rate: 0.2 },
  ATHLETE: { label: "Athlete", rate: 0.05 },
  SOLO_PARENT: { label: "Solo Parent", rate: 0.1 },
};

function nowIso() {
  return new Date().toISOString();
}

function nextId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function hashLike(value) {
  return String(value);
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeRole(role) {
  const allowed = ["Cashier", "Supervisor", "Administrator"];
  return allowed.includes(role) ? role : "Cashier";
}

function seedState() {
  const createdAt = nowIso();
  const users = [
    {
      id: "u-admin-1",
      username: "admin",
      password: hashLike("Admin@123"),
      fullName: "Admin User",
      email: "admin@sariph.local",
      role: "Administrator",
      status: "Active",
      isTempPassword: false,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "u-supervisor-1",
      username: "supervisor1",
      password: hashLike("Supervisor@123"),
      fullName: "Supervisor One",
      email: "supervisor@sariph.local",
      role: "Supervisor",
      status: "Active",
      isTempPassword: false,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "u-cashier-1",
      username: "cashier1",
      password: hashLike("Cashier@123"),
      fullName: "Cashier One",
      email: "cashier@sariph.local",
      role: "Cashier",
      status: "Active",
      isTempPassword: false,
      createdAt,
      updatedAt: createdAt,
    },
  ];

  const products = [
    {
      id: "p-1",
      name: "Notebook",
      barcode: "480000000001",
      price: 50,
      stock: 120,
      status: "Active",
      createdAt,
      updatedAt: createdAt,
      priceHistory: [{ price: 50, changedAt: createdAt, changedBy: "system" }],
    },
    {
      id: "p-2",
      name: "Ballpen",
      barcode: "480000000002",
      price: 10,
      stock: 300,
      status: "Active",
      createdAt,
      updatedAt: createdAt,
      priceHistory: [{ price: 10, changedAt: createdAt, changedBy: "system" }],
    },
    {
      id: "p-3",
      name: "Bottled Water 500ml",
      barcode: "480000000003",
      price: 20,
      stock: 80,
      status: "Active",
      createdAt,
      updatedAt: createdAt,
      priceHistory: [{ price: 20, changedAt: createdAt, changedBy: "system" }],
    },
  ];

  return {
    auth: {
      currentUserId: null,
      pendingPasswordChangeUserId: null,
      sessionRole: null,
      sessionDisplayName: null,
      sessionUsername: null,
    },
    users,
    products,
    transactions: [],
    canceledSales: [],
    voidedItems: [],
    postVoidRequests: [],
    reprintLogs: [],
    auditLogs: [
      {
        id: nextId("audit"),
        type: "system",
        action: "SEED",
        entity: "system",
        entityId: "seed",
        performedBy: "system",
        details: "Initialized frontend-only POS store",
        timestamp: createdAt,
      },
    ],
    receipt: {
      lastTransactionId: null,
      currentReceipt: null,
    },
  };
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : seedState();
  } catch (_err) {
    return seedState();
  }
}

function persistState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_err) {
    // no-op
  }
}

function auditEntry(type, action, entity, entityId, performedBy, details) {
  return {
    id: nextId("audit"),
    type,
    action,
    entity,
    entityId,
    performedBy,
    details,
    timestamp: nowIso(),
  };
}

function countActiveAdmins(users) {
  return users.filter((u) => u.role === "Administrator" && u.status === "Active").length;
}

function validatePasswordComplexity(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}

function validateProductPayload(payload, existingProducts, mode = "create", currentId = null) {
  const errors = {};
  const name = normalizeText(payload.name);
  const barcode = normalizeText(payload.barcode);
  const price = Number(payload.price);
  const stockText = String(payload.stock ?? "");
  const stock = Number(stockText);

  if (!name) errors.name = "Product name is required.";
  if (!barcode) errors.barcode = "Barcode is required.";
  if (barcode) {
    const duplicate = existingProducts.find(
      (p) => p.barcode === barcode && (mode === "create" || p.id !== currentId)
    );
    if (duplicate) errors.barcode = "Barcode must be unique.";
  }

  if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Price must be a positive decimal value.";
  }

  if (!/^\d+$/.test(stockText) || !Number.isFinite(stock) || stock < 0) {
    errors.stock = "Stock must be a non-negative integer.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    clean: {
      name,
      barcode,
      price,
      stock,
    },
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN": {
      const username = normalizeText(action.payload.username).toLowerCase();
      const password = hashLike(action.payload.password);
      const user = state.users.find((u) => u.username.toLowerCase() === username);

      if (!user) {
        return { ...state, _result: { ok: false, error: "Invalid username or password." } };
      }
      if (user.status !== "Active") {
        return { ...state, _result: { ok: false, error: "This account is inactive." } };
      }
      if (user.password !== password) {
        return { ...state, _result: { ok: false, error: "Invalid username or password." } };
      }

      const needsPasswordChange = !!user.isTempPassword;
      const next = {
        ...state,
        auth: {
          currentUserId: needsPasswordChange ? null : user.id,
          pendingPasswordChangeUserId: needsPasswordChange ? user.id : null,
          sessionRole: needsPasswordChange ? null : user.role,
          sessionDisplayName: needsPasswordChange ? null : user.fullName,
          sessionUsername: needsPasswordChange ? null : user.username,
        },
        auditLogs: [
          auditEntry("user", "LOGIN_SUCCESS", "user", user.id, user.username, "User logged in"),
          ...state.auditLogs,
        ],
        _result: { ok: true, needsPasswordChange, user },
      };
      return next;
    }

    case "LOGOUT": {
      const currentUser = state.users.find((u) => u.id === state.auth.currentUserId);
      return {
        ...state,
        auth: {
          currentUserId: null,
          pendingPasswordChangeUserId: null,
          sessionRole: null,
          sessionDisplayName: null,
          sessionUsername: null,
        },
        auditLogs: currentUser
          ? [auditEntry("user", "LOGOUT", "user", currentUser.id, currentUser.username, "User logged out"), ...state.auditLogs]
          : state.auditLogs,
      };
    }

    case "CHANGE_TEMP_PASSWORD": {
      const { userId, newPassword } = action.payload;
      if (!validatePasswordComplexity(newPassword)) {
        return { ...state, _result: { ok: false, error: "Password does not meet complexity requirements." } };
      }

      const users = state.users.map((u) =>
        u.id === userId
          ? {
              ...u,
              password: hashLike(newPassword),
              isTempPassword: false,
              updatedAt: nowIso(),
            }
          : u
      );
      const user = users.find((u) => u.id === userId);
      if (!user) return { ...state, _result: { ok: false, error: "User not found." } };

      return {
        ...state,
        users,
        auth: {
          currentUserId: userId,
          pendingPasswordChangeUserId: null,
          sessionRole: user.role,
          sessionDisplayName: user.fullName,
          sessionUsername: user.username,
        },
        auditLogs: [
          auditEntry("user", "PASSWORD_CHANGED", "user", userId, user.username, "Temporary password changed at login"),
          ...state.auditLogs,
        ],
        _result: { ok: true },
      };
    }

    case "CREATE_PRODUCT": {
      const actor = action.payload.actor;
      const check = validateProductPayload(action.payload.product, state.products, "create");
      if (!check.isValid) {
        return { ...state, _result: { ok: false, errors: check.errors } };
      }
      const createdAt = nowIso();
      const product = {
        id: nextId("p"),
        ...check.clean,
        status: "Active",
        createdAt,
        updatedAt: createdAt,
        priceHistory: [{ price: check.clean.price, changedAt: createdAt, changedBy: actor }],
      };

      return {
        ...state,
        products: [product, ...state.products],
        auditLogs: [
          auditEntry("product", "CREATE", "product", product.id, actor, `Created product ${product.name}`),
          ...state.auditLogs,
        ],
        _result: { ok: true, product },
      };
    }

    case "UPDATE_PRODUCT": {
      const { actor, productId, updates } = action.payload;
      const current = state.products.find((p) => p.id === productId);
      if (!current) return { ...state, _result: { ok: false, error: "Product not found." } };

      const check = validateProductPayload({ ...updates, barcode: current.barcode }, state.products, "update", productId);
      if (!check.isValid) {
        return { ...state, _result: { ok: false, errors: check.errors } };
      }

      const changedPrice = Number(current.price) !== Number(check.clean.price);
      const updatedAt = nowIso();
      const nextProduct = {
        ...current,
        name: check.clean.name,
        price: check.clean.price,
        stock: check.clean.stock,
        updatedAt,
        priceHistory: changedPrice
          ? [{ price: check.clean.price, changedAt: updatedAt, changedBy: actor }, ...(current.priceHistory || [])]
          : current.priceHistory,
      };

      return {
        ...state,
        products: state.products.map((p) => (p.id === productId ? nextProduct : p)),
        auditLogs: [
          auditEntry("product", "UPDATE", "product", productId, actor, `Updated product ${nextProduct.name}`),
          ...state.auditLogs,
        ],
        _result: { ok: true, product: nextProduct },
      };
    }

    case "SET_PRODUCT_STATUS": {
      const { actor, productId, status } = action.payload;
      const current = state.products.find((p) => p.id === productId);
      if (!current) return { ...state, _result: { ok: false, error: "Product not found." } };
      const updatedAt = nowIso();
      const nextProduct = { ...current, status, updatedAt };
      const actionName = status === "Inactive" ? "DEACTIVATE" : "REACTIVATE";
      return {
        ...state,
        products: state.products.map((p) => (p.id === productId ? nextProduct : p)),
        auditLogs: [
          auditEntry("product", actionName, "product", productId, actor, `${actionName} product ${current.name}`),
          ...state.auditLogs,
        ],
        _result: { ok: true },
      };
    }

    case "CREATE_USER": {
      const { actor, user } = action.payload;
      const errors = {};
      const username = normalizeText(user.username);
      const fullName = normalizeText(user.fullName);
      const email = normalizeText(user.email);
      const password = String(user.password || "");
      const role = normalizeRole(user.role);

      if (!username) errors.username = "Username is required.";
      if (!fullName) errors.fullName = "Full name is required.";
      if (!email) errors.email = "Email is required.";
      if (!password) errors.password = "Password is required.";
      if (email && !validateEmail(email)) errors.email = "Email format is invalid.";
      if (password && !validatePasswordComplexity(password)) {
        errors.password = "Password must be 8+ chars with uppercase, lowercase, number, and special character.";
      }

      if (state.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        errors.username = "Username already exists.";
      }

      if (Object.keys(errors).length > 0) {
        return { ...state, _result: { ok: false, errors } };
      }

      const createdAt = nowIso();
      const nextUser = {
        id: nextId("u"),
        username,
        fullName,
        email,
        password: hashLike(password),
        role,
        status: "Active",
        isTempPassword: false,
        createdAt,
        updatedAt: createdAt,
      };

      return {
        ...state,
        users: [nextUser, ...state.users],
        auditLogs: [
          auditEntry("user", "CREATE", "user", nextUser.id, actor, `Created user ${nextUser.username} (${nextUser.role})`),
          ...state.auditLogs,
        ],
        _result: { ok: true, user: nextUser },
      };
    }

    case "UPDATE_USER": {
      const { actor, userId, updates } = action.payload;
      const current = state.users.find((u) => u.id === userId);
      if (!current) return { ...state, _result: { ok: false, error: "User not found." } };

      const errors = {};
      const fullName = normalizeText(updates.fullName);
      const email = normalizeText(updates.email);
      const role = normalizeRole(updates.role);

      if (!fullName) errors.fullName = "Full name is required.";
      if (!email) errors.email = "Email is required.";
      if (email && !validateEmail(email)) errors.email = "Email format is invalid.";

      const onlyActiveAdmin = countActiveAdmins(state.users) === 1;
      if (
        current.role === "Administrator" &&
        role !== "Administrator" &&
        current.status === "Active" &&
        onlyActiveAdmin
      ) {
        errors.role = "Cannot remove the Administrator role from the only active administrator.";
      }

      if (Object.keys(errors).length > 0) {
        return { ...state, _result: { ok: false, errors } };
      }

      const updatedUser = {
        ...current,
        fullName,
        email,
        role,
        updatedAt: nowIso(),
      };

      const roleChanged = current.role !== role;
      return {
        ...state,
        users: state.users.map((u) => (u.id === userId ? updatedUser : u)),
        auditLogs: [
          auditEntry(
            "user",
            roleChanged ? "UPDATE_ROLE" : "UPDATE",
            "user",
            userId,
            actor,
            roleChanged
              ? `Role changed ${current.role} -> ${role}`
              : `Updated profile fields for ${updatedUser.username}`
          ),
          ...state.auditLogs,
        ],
        _result: { ok: true },
      };
    }

    case "RESET_USER_PASSWORD": {
      const { actor, userId, mode, value } = action.payload;
      const user = state.users.find((u) => u.id === userId);
      if (!user) return { ...state, _result: { ok: false, error: "User not found." } };

      let nextPassword = "";
      let isTempPassword = false;

      if (mode === "temporary") {
        const seed = Math.random().toString(36).slice(-4);
        nextPassword = `Tmp@${seed}A1`;
        isTempPassword = true;
      } else {
        nextPassword = String(value || "");
        if (!validatePasswordComplexity(nextPassword)) {
          return {
            ...state,
            _result: {
              ok: false,
              error: "Password must be 8+ chars with uppercase, lowercase, number, and special character.",
            },
          };
        }
      }

      const users = state.users.map((u) =>
        u.id === userId
          ? { ...u, password: hashLike(nextPassword), isTempPassword, updatedAt: nowIso() }
          : u
      );

      return {
        ...state,
        users,
        auditLogs: [
          auditEntry(
            "user",
            "RESET_PASSWORD",
            "user",
            userId,
            actor,
            `${mode === "temporary" ? "Temporary" : "Permanent"} password reset for ${user.username}`
          ),
          ...state.auditLogs,
        ],
        _result: { ok: true, temporaryPassword: mode === "temporary" ? nextPassword : null },
      };
    }

    case "SET_USER_STATUS": {
      const { actor, userId, status } = action.payload;
      const target = state.users.find((u) => u.id === userId);
      if (!target) return { ...state, _result: { ok: false, error: "User not found." } };

      if (target.role === "Administrator" && target.status === "Active" && status === "Inactive") {
        if (countActiveAdmins(state.users) === 1) {
          return {
            ...state,
            _result: { ok: false, error: "Cannot deactivate the only active administrator." },
          };
        }
      }

      const users = state.users.map((u) => (u.id === userId ? { ...u, status, updatedAt: nowIso() } : u));

      return {
        ...state,
        users,
        auditLogs: [
          auditEntry(
            "user",
            status === "Inactive" ? "DEACTIVATE" : "REACTIVATE",
            "user",
            userId,
            actor,
            `${status} user ${target.username}`
          ),
          ...state.auditLogs,
        ],
        _result: { ok: true },
      };
    }

    case "COMPLETE_SALE": {
      const { actor, cartItems, payment, discountType } = action.payload;
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return { ...state, _result: { ok: false, error: "Cart is empty." } };
      }

      const activeProductsMap = new Map(state.products.map((p) => [p.id, p]));
      for (const item of cartItems) {
        const p = activeProductsMap.get(item.productId);
        if (!p || p.status !== "Active") {
          return { ...state, _result: { ok: false, error: `${item.name} is inactive or missing.` } };
        }
        if (p.stock < item.qty) {
          return { ...state, _result: { ok: false, error: `Insufficient stock for ${item.name}.` } };
        }
      }

      const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
      const discountRule = DISCOUNT_RULES[discountType] || DISCOUNT_RULES.NONE;
      const discountAmount = Number((subtotal * discountRule.rate).toFixed(2));
      const total = Number(Math.max(subtotal - discountAmount, 0).toFixed(2));
      const cash = Number(payment.cash || 0);

      if (!Number.isFinite(cash) || cash < total) {
        return { ...state, _result: { ok: false, error: "Insufficient payment." } };
      }

      const txId = `TXN-${Date.now()}`;
      const createdAt = nowIso();
      const transaction = {
        id: txId,
        status: "Completed",
        cashierUsername: actor,
        createdAt,
        items: cartItems.map((i) => ({ ...i })),
        subtotal,
        discount: {
          type: discountType,
          label: discountRule.label,
          rate: discountRule.rate,
          amount: discountAmount,
        },
        total,
        payment: {
          cash,
          change: Number((cash - total).toFixed(2)),
        },
      };

      const nextProducts = state.products.map((p) => {
        const item = cartItems.find((c) => c.productId === p.id);
        if (!item) return p;
        return { ...p, stock: p.stock - item.qty, updatedAt: createdAt };
      });

      return {
        ...state,
        products: nextProducts,
        transactions: [transaction, ...state.transactions],
        receipt: {
          ...state.receipt,
          lastTransactionId: txId,
          currentReceipt: { transactionId: txId, mode: "ORIGINAL" },
        },
        auditLogs: [
          auditEntry("sales", "COMPLETE_SALE", "transaction", txId, actor, `Completed sale ${txId}`),
          ...state.auditLogs,
        ],
        _result: { ok: true, transaction },
      };
    }

    case "CANCEL_SALE": {
      const { actor, cartItems, reason } = action.payload;
      const id = nextId("cancel");
      const canceled = {
        id,
        actor,
        reason: normalizeText(reason) || "Canceled before payment",
        items: cartItems || [],
        timestamp: nowIso(),
      };
      return {
        ...state,
        canceledSales: [canceled, ...state.canceledSales],
        auditLogs: [
          auditEntry("sales", "CANCEL_SALE", "canceledSale", id, actor, canceled.reason),
          ...state.auditLogs,
        ],
        _result: { ok: true },
      };
    }

    case "VOID_ITEM_LOG": {
      const { actor, item, reason } = action.payload;
      const entry = {
        id: nextId("void-item"),
        actor,
        item,
        reason: normalizeText(reason) || "Voided during sale",
        timestamp: nowIso(),
      };
      return {
        ...state,
        voidedItems: [entry, ...state.voidedItems],
        auditLogs: [
          auditEntry("sales", "VOID_ITEM", "item", item?.productId || item?.name || "unknown", actor, entry.reason),
          ...state.auditLogs,
        ],
      };
    }

    case "REQUEST_POST_VOID": {
      const { actor, transactionId, reason } = action.payload;
      const tx = state.transactions.find((t) => t.id === transactionId);
      if (!tx) return { ...state, _result: { ok: false, error: "Transaction not found." } };
      if (tx.status === "Voided") {
        return { ...state, _result: { ok: false, error: "Transaction already voided." } };
      }
      if (!normalizeText(reason)) {
        return { ...state, _result: { ok: false, error: "Reason is required for post-void request." } };
      }
      const request = {
        id: nextId("post-void"),
        transactionId,
        requestedBy: actor,
        reason: normalizeText(reason),
        status: "Pending",
        createdAt: nowIso(),
      };

      return {
        ...state,
        postVoidRequests: [request, ...state.postVoidRequests],
        auditLogs: [
          auditEntry("sales", "REQUEST_POST_VOID", "transaction", transactionId, actor, request.reason),
          ...state.auditLogs,
        ],
        _result: { ok: true, request },
      };
    }

    case "DECIDE_POST_VOID": {
      const { actor, requestId, decision, reason } = action.payload;
      const request = state.postVoidRequests.find((r) => r.id === requestId);
      if (!request) return { ...state, _result: { ok: false, error: "Request not found." } };
      if (request.status !== "Pending") {
        return { ...state, _result: { ok: false, error: "Request already decided." } };
      }
      if (!normalizeText(reason)) {
        return { ...state, _result: { ok: false, error: "Reason is required." } };
      }

      let nextTransactions = state.transactions;
      let nextProducts = state.products;
      if (decision === "Approved") {
        const tx = state.transactions.find((t) => t.id === request.transactionId);
        if (tx) {
          nextTransactions = state.transactions.map((t) =>
            t.id === tx.id
              ? {
                  ...t,
                  status: "Voided",
                  voidInfo: {
                    approvedBy: actor,
                    approvedAt: nowIso(),
                    reason: normalizeText(reason),
                    requestReason: request.reason,
                  },
                }
              : t
          );
          nextProducts = state.products.map((p) => {
            const line = tx.items.find((i) => i.productId === p.id);
            if (!line) return p;
            return { ...p, stock: p.stock + line.qty, updatedAt: nowIso() };
          });
        }
      }

      const decidedAt = nowIso();
      const nextRequests = state.postVoidRequests.map((r) =>
        r.id === requestId
          ? { ...r, status: decision, decisionReason: normalizeText(reason), decidedBy: actor, decidedAt }
          : r
      );

      return {
        ...state,
        products: nextProducts,
        transactions: nextTransactions,
        postVoidRequests: nextRequests,
        auditLogs: [
          auditEntry(
            "sales",
            decision === "Approved" ? "APPROVE_POST_VOID" : "REJECT_POST_VOID",
            "postVoidRequest",
            requestId,
            actor,
            `${decision}: ${normalizeText(reason)}`
          ),
          ...state.auditLogs,
        ],
        _result: { ok: true },
      };
    }

    case "SET_RECEIPT_VIEW": {
      const { transactionId, mode } = action.payload;
      return {
        ...state,
        receipt: {
          ...state.receipt,
          currentReceipt: { transactionId, mode },
        },
      };
    }

    case "LOG_REPRINT": {
      const { actor, transactionId, byRole, label } = action.payload;
      const log = {
        id: nextId("reprint"),
        actor,
        byRole,
        transactionId,
        label,
        timestamp: nowIso(),
      };
      return {
        ...state,
        reprintLogs: [log, ...state.reprintLogs],
        auditLogs: [
          auditEntry("receipt", "REPRINT", "transaction", transactionId, actor, `${label} by ${byRole}`),
          ...state.auditLogs,
        ],
      };
    }

    case "CLEAR_RESULT": {
      const { _result, ...rest } = state;
      return rest;
    }

    default:
      return state;
  }
}

const PosContext = createContext(null);

export function PosProvider({ children }) {
  const [state, setState] = useState(loadState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const dispatch = (action) => {
    const next = reducer(stateRef.current, action);
    stateRef.current = next;
    setState(next);
  };

  const runAction = (action) => {
    const next = reducer(stateRef.current, action);
    stateRef.current = next;
    setState(next);
    return next._result || { ok: true };
  };

  useEffect(() => {
    const { _result, ...persistable } = state;
    persistState(persistable);
  }, [state]);

  const currentUser = useMemo(() => {
    const user = state.users.find((u) => u.id === state.auth.currentUserId);
    if (!user) return null;
    return {
      ...user,
      role: state.auth.sessionRole || user.role,
      fullName: state.auth.sessionDisplayName || user.fullName,
      username: state.auth.sessionUsername || user.username,
    };
  }, [
    state.users,
    state.auth.currentUserId,
    state.auth.sessionRole,
    state.auth.sessionDisplayName,
    state.auth.sessionUsername,
  ]);

  const pendingPasswordUser = useMemo(
    () => state.users.find((u) => u.id === state.auth.pendingPasswordChangeUserId) || null,
    [state.users, state.auth.pendingPasswordChangeUserId]
  );

  const value = useMemo(
    () => ({
      state,
      dispatch,
      runAction,
      currentUser,
      pendingPasswordUser,
      discountRules: DISCOUNT_RULES,
      validatePasswordComplexity,
      validateEmail,
      clearResult: () => dispatch({ type: "CLEAR_RESULT" }),
    }),
    [state, currentUser, pendingPasswordUser]
  );

  return <PosContext.Provider value={value}>{children}</PosContext.Provider>;
}

export function usePos() {
  const ctx = useContext(PosContext);
  if (!ctx) throw new Error("usePos must be used inside PosProvider");
  return ctx;
}
