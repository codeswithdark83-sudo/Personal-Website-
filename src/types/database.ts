// Mirrors the public tables created by supabase/migrations (portfolio_schema). Regenerate with the
// Supabase CLI (`supabase gen types typescript`) after schema changes. Only portfolio tables are listed.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Required extends keyof Row> = {
  Row: Row;
  Insert: Pick<Row, Required> & Partial<Omit<Row, Required>>;
  Update: Partial<Row>;
  Relationships: [];
};

type Status = "draft" | "published";
export type InquiryStatus = "new" | "contacted" | "qualified" | "proposal_sent" | "won" | "closed";

export type Database = {
  public: {
    Tables: {
      admins: Table<{ user_id: string; created_at: string }, "user_id">;
      profiles: Table<{ id: string; display_name: string; headline: string; bio: string; avatar_path: string | null; resume_path: string | null; location_label: string | null; availability_status: "available" | "limited" | "unavailable"; updated_at: string }, "display_name">;
      technologies: Table<{ id: string; name: string; created_at: string }, "name">;
      projects: Table<{ id: string; title: string; slug: string; summary: string; description: string; cover_image_path: string | null; gallery_paths: string[]; live_url: string | null; repository_url: string | null; project_type: string; category: string; timeline_label: string | null; featured: boolean; status: Status; sort_order: number; published_at: string | null; created_at: string; updated_at: string }, "title" | "slug">;
      case_studies: Table<{ id: string; project_id: string; problem: string | null; goals: string | null; role: string | null; approach: string | null; solution: string | null; architecture: string | null; challenges: string | null; outcomes: string | null; lessons_learned: string | null; content_blocks: Json; created_at: string; updated_at: string }, "project_id">;
      project_technologies: Table<{ project_id: string; technology_id: string }, "project_id" | "technology_id">;
      skills: Table<{ id: string; name: string; category: string; visible: boolean; sort_order: number }, "name">;
      experiences: Table<{ id: string; role: string; organization: string; description: string | null; start_date: string | null; end_date: string | null; url: string | null; visible: boolean; sort_order: number }, "role" | "organization">;
      education: Table<{ id: string; institution: string; qualification: string; description: string | null; start_date: string | null; end_date: string | null; visible: boolean; sort_order: number }, "institution" | "qualification">;
      certifications: Table<{ id: string; title: string; issuer: string; issued_on: string | null; expires_on: string | null; credential_id: string | null; verification_url: string | null; visible: boolean; sort_order: number }, "title" | "issuer">;
      services: Table<{ id: string; title: string; slug: string; description: string; icon: "monitor" | "code" | "layers" | "cart" | "plug" | "wrench"; target_client: string | null; scope: string | null; pricing_note: string | null; timeline_note: string | null; deliverables: string[]; faqs: Json; cta_label: string; status: Status; sort_order: number; created_at: string; updated_at: string }, "title" | "slug">;
      blog_posts: Table<{ id: string; title: string; slug: string; excerpt: string; body: string; cover_image_path: string | null; category: string; tags: string[]; seo_title: string | null; seo_description: string | null; status: Status; published_at: string | null; created_at: string; updated_at: string }, "title" | "slug">;
      inquiries: Table<{ id: string; name: string; email: string; company: string | null; phone: string | null; project_type: string; project_title: string | null; budget_range: string | null; timeline: string | null; brief: string; details: Json; preferred_contact: "email" | "whatsapp" | "phone" | "linkedin" | "instagram"; status: InquiryStatus; next_action: string | null; follow_up_at: string | null; email_notification: "pending" | "sent" | "failed" | "skipped"; created_at: string; updated_at: string }, "name" | "email" | "project_type" | "brief">;
      inquiry_notes: Table<{ id: string; inquiry_id: string; author_id: string | null; note: string; created_at: string }, "inquiry_id" | "note">;
      social_links: Table<{ id: string; platform: "github" | "linkedin" | "instagram" | "whatsapp" | "email" | "scheduling"; url: string; visible: boolean; sort_order: number }, "platform" | "url">;
      site_settings: Table<{ key: string; value: Json; is_public: boolean; updated_at: string }, "key" | "value">;
      media_assets: Table<{ id: string; bucket: "public-assets" | "private-documents"; path: string; alt_text: string | null; mime_type: string; size_bytes: number; created_at: string }, "bucket" | "path" | "mime_type" | "size_bytes">;
    };
    Views: { [_ in never]: never };
    Functions: { is_admin: { Args: Record<string, never>; Returns: boolean } };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
