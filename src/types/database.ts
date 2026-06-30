export type VehicleCategory = "motos" | "scooters";
export type Plan = "free" | "premium";
export type PlanStatus = "active" | "past_due" | "canceled" | "pending";
export type PlanInterval = "monthly" | "yearly";
export type UsageProfile = "daily" | "often" | "occasional" | "rare";
export type MaintenancePriority = "normal" | "important" | "urgent";
export type MaintenanceStatus = "upcoming" | "due_soon" | "overdue" | "done";
export type MaintenanceSource = "manual" | "template";
export type TemplateSource = "hardcoded" | "community" | "approved";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan: Plan;
  plan_status: PlanStatus;
  plan_interval: PlanInterval | null;
  plan_renews_at: string | null;
  plan_canceled_at: string | null;
  mollie_customer_id: string | null;
  mollie_subscription_id: string | null;
  mollie_mandate_id: string | null;
  dealer_premium_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  category: VehicleCategory;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  date_mise_en_circulation: string | null;
  date_achat: string | null;
  carburant: string | null;
  immatriculation: string | null;
  vin: string | null;
  surnom: string | null;
  photo_url: string | null;
  usage_profile: UsageProfile;
  avg_km_per_year: number;
  last_odometer_value: number;
  last_odometer_date: string;
  last_estimation_reminder_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceEntry {
  id: string;
  user_id: string;
  vehicle_id: string;
  titre: string;
  date_entretien: string;
  kilometrage: number;
  cout: number | null;
  description: string | null;
  maintenance_plan_entry_id: string | null;
  created_at: string;
}

export interface UpcomingMaintenance {
  id: string;
  user_id: string;
  vehicle_id: string;
  titre: string;
  due_date: string | null;
  due_km: number | null;
  niveau_urgence: "normal" | "urgent";
  description: string | null;
  source: MaintenanceSource;
  created_at: string;
}

export interface MaintenancePlanEntry {
  id: string;
  user_id: string;
  vehicle_id: string;
  titre: string;
  categorie: string;
  description: string | null;
  interval_km: number | null;
  interval_months: number | null;
  first_due_km: number | null;
  first_due_date: string | null;
  last_done_km: number | null;
  last_done_date: string | null;
  next_due_km: number | null;
  next_due_date: string | null;
  due_soon_km_threshold: number;
  due_soon_days_threshold: number;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  source: MaintenanceSource;
  template_source: TemplateSource | null;
  created_at: string;
  updated_at: string;
}

export interface Modification {
  id: string;
  user_id: string;
  vehicle_id: string;
  titre: string;
  marque: string | null;
  modele: string | null;
  date_pose: string | null;
  cout: number | null;
  facture_url: string | null;
  created_at: string;
}

export interface VehicleDocument {
  id: string;
  user_id: string;
  vehicle_id: string;
  nom_fichier: string;
  type_fichier: string;
  url: string;
  taille: number | null;
  created_at: string;
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
}

export interface DealerActivationCode {
  id: string;
  code: string;
  dealer_name: string | null;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  vehicle_model: string | null;
  purchase_date: string | null;
  used_by: string | null;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
}
