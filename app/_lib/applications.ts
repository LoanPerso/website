import { supabase } from "./supabase";

/**
 * Loan application status
 */
export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "cancelled";

/**
 * Loan application data structure
 */
export interface LoanApplication {
  id?: string;
  user_id: string;
  status: ApplicationStatus;
  created_at?: string;
  updated_at?: string;

  // Simulation data
  credit_type: string;
  amount: number;
  duration: number;
  monthly_payment: number;
  effective_rate: number;
  country: string;

  // Identity
  first_name: string;
  last_name: string;
  birth_date: string;
  birth_place: string;
  nationality: string;
  marital_status: string;
  id_type: string;
  id_number: string;

  // Contact
  email: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  address_country: string;

  // Employment
  employer_name: string;
  employer_address: string;
  job_title: string;
  contract_type: string;
  start_date: string;
  monthly_net_income: number;

  // Documents (URLs after upload)
  document_id_url?: string;
  document_income_url?: string;
  document_address_url?: string;
  document_bank_url?: string;
}

export type ApplicationResult<T> = {
  data: T | null;
  error: { message: string; code?: string } | null;
};

/**
 * Create a new loan application
 */
export async function createApplication(
  application: Omit<LoanApplication, "id" | "created_at" | "updated_at">
): Promise<ApplicationResult<LoanApplication>> {
  try {
    const { data, error } = await supabase
      .from("loan_applications")
      .insert([application])
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    return { data, error: null };
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
 * Get all applications for a user
 */
export async function getUserApplications(
  userId: string
): Promise<ApplicationResult<LoanApplication[]>> {
  try {
    const { data, error } = await supabase
      .from("loan_applications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    return { data: data || [], error: null };
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
 * Get a single application by ID
 */
export async function getApplication(
  applicationId: string
): Promise<ApplicationResult<LoanApplication>> {
  try {
    const { data, error } = await supabase
      .from("loan_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    return { data, error: null };
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
 * Update application status
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<ApplicationResult<LoanApplication>> {
  try {
    const { data, error } = await supabase
      .from("loan_applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", applicationId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    return { data, error: null };
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
 * Upload a document and return the URL
 */
export async function uploadDocument(
  userId: string,
  applicationId: string,
  file: File,
  docType: "id" | "income" | "address" | "bank"
): Promise<ApplicationResult<string>> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${applicationId}/${docType}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("application-documents")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return {
        data: null,
        error: {
          message: uploadError.message,
        },
      };
    }

    const { data: urlData } = supabase.storage
      .from("application-documents")
      .getPublicUrl(fileName);

    return { data: urlData.publicUrl, error: null };
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
