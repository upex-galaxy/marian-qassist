// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  subscription_tier: 'free' | 'pro';
  created_at: string;
  updated_at: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  jira_project_key: string | null;
  created_at: string;
  updated_at: string;
}

// Sprint types
export interface Sprint {
  id: string;
  name: string;
  project_id: string;
  jira_sprint_id: string | null;
  status: 'active' | 'future' | 'completed';
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

// User Story types
export interface UserStory {
  id: string;
  jira_issue_key: string;
  title: string;
  description: string | null;
  status: string;
  priority: 'high' | 'medium' | 'low';
  sprint_id: string | null;
  project_id: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

// Test Case types
export interface TestCase {
  id: string;
  test_case_number: string; // TC-001, TC-002, etc.
  title: string;
  content: string; // HTML content
  user_story_id: string;
  project_id: string;
  status: 'pass' | 'fail' | 'blocked' | 'not_executed';
  last_executed_at: string | null;
  executed_by: string | null;
  execution_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Evidence/Attachment types
export interface Attachment {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  test_case_id: string;
  thumbnail_url: string | null;
  uploaded_at: string;
}

// Jira Connection types
export interface JiraConnection {
  id: string;
  user_id: string;
  jira_instance_url: string;
  access_token: string; // encrypted
  refresh_token: string; // encrypted
  expires_at: string;
  status: 'active' | 'expired' | 'revoked';
  created_at: string;
  updated_at: string;
}

// Subscription types
export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan: 'pro_monthly' | 'pro_yearly';
  status: 'active' | 'canceled' | 'past_due';
  current_period_end: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  consent_terms: boolean;
}

export interface CreateProjectFormData {
  name: string;
  description?: string;
  jira_project_key?: string;
}
