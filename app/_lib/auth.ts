import { supabase } from "./supabase";
import type { AuthUser } from "@/_modules/auth";

export type AuthError = {
  message: string;
  code?: string;
};

export type AuthResult<T> = {
  data: T | null;
  error: AuthError | null;
};

/**
 * Register a new user with email and password
 */
export async function registerUser(
  email: string,
  password: string
): Promise<AuthResult<AuthUser>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    if (!data.user) {
      return {
        data: null,
        error: {
          message: "User creation failed",
          code: "USER_NOT_CREATED",
        },
      };
    }

    return {
      data: {
        id: data.user.id,
        email: data.user.email,
        provider: "password",
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : "Unknown error",
        code: "UNKNOWN_ERROR",
      },
    };
  }
}

/**
 * Sign in with email and password
 */
export async function signInUser(
  email: string,
  password: string
): Promise<AuthResult<AuthUser>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    if (!data.user) {
      return {
        data: null,
        error: {
          message: "Sign in failed",
          code: "SIGNIN_FAILED",
        },
      };
    }

    return {
      data: {
        id: data.user.id,
        email: data.user.email,
        provider: "password",
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : "Unknown error",
        code: "UNKNOWN_ERROR",
      },
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<AuthResult<null>> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : "Unknown error",
        code: "UNKNOWN_ERROR",
      },
    };
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<AuthResult<AuthUser>> {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    if (!data.user) {
      return {
        data: null,
        error: null, // Not an error, just not logged in
      };
    }

    return {
      data: {
        id: data.user.id,
        email: data.user.email,
        provider: "password",
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : "Unknown error",
        code: "UNKNOWN_ERROR",
      },
    };
  }
}

/**
 * Check if user exists by email
 */
export async function checkUserExists(email: string): Promise<boolean> {
  // Try to sign in with a wrong password to check if user exists
  // This is a workaround since Supabase doesn't have a direct "check user exists" method
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: "__check_only__",
  });

  // If error is "Invalid login credentials", user exists
  // If error is "Email not confirmed", user exists
  if (error) {
    const msg = error.message.toLowerCase();
    return msg.includes("invalid login credentials") || msg.includes("email not confirmed");
  }

  return true;
}
