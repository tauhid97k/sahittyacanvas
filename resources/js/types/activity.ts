/**
 * Activity Log Types
 * These types match Spatie Activity Log model
 */

export interface Activity {
    id: number;
    log_name: string | null;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    causer_type: string | null;
    causer_id: number | null;
    event: string | null;
    properties: Record<string, unknown>;
    batch_uuid: string | null;
    created_at: string;
    updated_at: string;
    // Computed/loaded
    subject_type_label?: string | null;
    causer_name?: string;
    causer?: {
        id: number;
        name: string;
    } | null;
    subject?: Record<string, unknown> | null;
}

export interface SubjectTypeOption {
    value: string;
    label: string;
}
