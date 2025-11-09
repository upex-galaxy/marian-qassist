---
id: STORY-QASSIST-005
jira_id: null
epic_id: EPIC-QASSIST-001
title: As a user, I want to manage my profile settings (name, email, avatar), so that I can personalize my account
priority: Medium
story_points: 3
assignee: null
status: To Do
---

# STORY-QASSIST-005: Manage profile settings

## Description

Implement a user profile management page where users can view and update their personal information (name, email, avatar). The page should be intuitive, secure (email change requires re-verification), and provide immediate feedback on updates.

## Acceptance Criteria (Gherkin format)

### Scenario 1: View current profile information
- **Given:** I am a logged-in user
- **When:** I navigate to Settings → Profile
- **Then:** I see my current profile information:
  - Name (editable text field)
  - Email (editable text field)
  - Avatar (image with "Upload new" button)
  - Account created date (read-only)
  - Subscription tier (read-only, links to upgrade page if Free)

### Scenario 2: Update name successfully
- **Given:** I am on the Profile settings page
- **When:** I change my name from "John Doe" to "Jane Smith" and click "Save"
- **Then:** I see a success message "Profile updated successfully"
- **And:** My name is updated in the database
- **And:** My name appears updated in the header/sidebar
- **And:** No email verification is required

### Scenario 3: Update email and trigger re-verification
- **Given:** I am on the Profile settings page
- **When:** I change my email from "old@example.com" to "new@example.com" and click "Save"
- **Then:** I see a message "Verification email sent to new@example.com"
- **And:** My email is updated to "new@example.com" with `email_verified: false` status
- **And:** I receive a verification email at the new address
- **And:** A yellow banner appears: "Please verify your new email address"
- **When:** I click the verification link in the email
- **Then:** My email is marked as verified (`email_verified: true`)
- **And:** The banner disappears

### Scenario 4: Email update fails if email already exists
- **Given:** I am on the Profile settings page
- **When:** I try to change my email to one that's already registered ("existing@example.com")
- **Then:** I see an error message "This email is already in use"
- **And:** My email remains unchanged
- **And:** No verification email is sent

### Scenario 5: Upload avatar image
- **Given:** I am on the Profile settings page
- **When:** I click "Upload avatar" and select a valid image file (PNG, JPEG, <2MB)
- **Then:** A crop modal appears showing the selected image
- **When:** I adjust the crop area and click "Save"
- **Then:** The image is uploaded to cloud storage (Supabase Storage)
- **And:** The image is resized to 256x256px and converted to WebP
- **And:** My `avatar_url` is updated in the database
- **And:** My new avatar appears in the header/sidebar immediately

### Scenario 6: Avatar upload fails with invalid file
- **Given:** I am on the Profile settings page
- **When:** I try to upload a file that is:
  - Too large (>2MB) OR
  - Wrong format (PDF, MP4, etc.)
- **Then:** I see an error message "File must be a JPEG or PNG image under 2MB"
- **And:** No upload occurs
- **And:** My current avatar remains unchanged

### Scenario 7: Remove avatar (reset to default)
- **Given:** I have a custom avatar uploaded
- **When:** I click "Remove avatar"
- **Then:** I see a confirmation modal "Remove your profile picture?"
- **When:** I confirm
- **Then:** My custom avatar is deleted from storage
- **And:** My `avatar_url` is set to null
- **And:** My initials appear as default avatar (e.g., "JD" for John Doe)

## Technical Notes

### API Endpoints

#### Get Profile
```typescript
GET /api/profile
Response (200 OK):
{
  id: string;
  name: string | null;
  email: string;
  email_verified: boolean;
  avatar_url: string | null;
  subscription_tier: "free" | "pro";
  storage_used_bytes: number;
  created_at: string;
}
```

#### Update Profile
```typescript
PATCH /api/profile
Request Body:
{
  name?: string; // max 100 chars
  email?: string; // RFC 5321 format
}

Response (200 OK):
{
  user: {
    id: string;
    name: string | null;
    email: string;
    email_verified: boolean;
    avatar_url: string | null;
  };
  email_changed: boolean; // true if email was updated
}

Errors:
400 Bad Request: { error_code: "INVALID_EMAIL" | "NAME_TOO_LONG" | "EMAIL_EXISTS" }
401 Unauthorized: { error_code: "UNAUTHENTICATED" }
500 Internal Server Error: { error_code: "SERVER_ERROR" }
```

#### Upload Avatar
```typescript
POST /api/profile/avatar
Request Body: FormData
{
  file: File; // JPEG or PNG, max 2MB
}

Response (200 OK):
{
  avatar_url: string; // Cloudfront/Supabase Storage URL
}

Errors:
400 Bad Request: { error_code: "INVALID_FILE_TYPE" | "FILE_TOO_LARGE" }
413 Payload Too Large: { error_code: "FILE_TOO_LARGE" }
500 Internal Server Error: { error_code: "UPLOAD_FAILED" }
```

#### Delete Avatar
```typescript
DELETE /api/profile/avatar
Response (200 OK):
{
  message: "Avatar removed successfully"
}
```

### Avatar Upload Flow
1. User selects image file (client validates: JPEG/PNG, <2MB)
2. Show crop modal using [react-easy-crop](https://github.com/ValentinH/react-easy-crop)
3. User adjusts crop area (constrained to 1:1 aspect ratio)
4. Client crops image and converts to Blob
5. Upload Blob to Supabase Storage bucket: `avatars/{user_id}/{timestamp}.webp`
6. Server-side: Resize to 256x256px, convert to WebP (for smaller file size)
7. Return public URL
8. Update `users.avatar_url` in database
9. Delete old avatar from storage (if exists)

### Email Change Flow
1. User enters new email
2. Validate email format and uniqueness
3. Update `users.email` and set `email_verified: false`
4. Generate email verification token (UUID v4, 24-hour expiration)
5. Send verification email to new address:
   ```
   Subject: Verify your new email for QAssist

   Hi [Name],

   You recently changed your email to [new@example.com]. Please verify this email address:

   [Verify Email Button]

   This link expires in 24 hours.

   If you didn't make this change, please contact support immediately.
   ```
6. User clicks link → Token validated → Set `email_verified: true`

### Database Updates
```sql
-- Add email_verified column if not exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT true;

-- Add avatar_url column if not exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  email TEXT NOT NULL, -- New email to verify
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Storage Configuration
```typescript
// Supabase Storage bucket: avatars
const supabaseStorageConfig = {
  bucket: 'avatars',
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize: 2 * 1024 * 1024, // 2MB
  public: true, // Allow public read access
};
```

## UI/UX Requirements

### Profile Settings Page
- **URL:** `/settings/profile`
- **Layout:** Two-column layout (desktop), single column (mobile)

#### Left Column: Profile Information
1. **Avatar Section:**
   - Current avatar (256x256px, rounded)
   - "Upload new" button (file picker)
   - "Remove" button (if avatar exists)
   - Accepted formats: JPEG, PNG
   - Max size: 2MB

2. **Name Field:**
   - Text input, max 100 characters
   - Placeholder: "Your full name"
   - Auto-save on blur (debounced)

3. **Email Field:**
   - Text input, email validation
   - Warning icon if email not verified
   - "Resend verification email" link (if unverified)

4. **Save Button:**
   - Disabled if no changes
   - Shows "Saving..." during API call
   - Shows checkmark on success

#### Right Column: Account Information
1. **Subscription Tier:**
   - Badge: "Free" or "Pro"
   - "Upgrade to Pro" link (if Free)

2. **Storage Usage:**
   - Progress bar: "250 MB / 500 MB used"
   - "Manage storage" link

3. **Account Created:**
   - Read-only text: "Member since Jan 15, 2025"

4. **Danger Zone:**
   - "Delete Account" button (red, secondary)
   - Opens confirmation modal (out of scope for this story)

### Avatar Crop Modal
- Modal overlay with image preview
- Crop tool: Drag to reposition, scroll to zoom
- Buttons: "Cancel", "Save" (primary)
- Preview: Show cropped result in real-time

### Success/Error States
- Success toast: "Profile updated successfully ✓"
- Error toast: "Failed to update profile. Please try again."
- Email verification banner (yellow): "Please verify your email: [new@example.com]"

## Definition of Done

- [ ] Profile settings page designed and implemented
- [ ] Get profile API endpoint working
- [ ] Update profile API endpoint working (name, email)
- [ ] Email change triggers re-verification flow
- [ ] Email uniqueness validation working
- [ ] Avatar upload API endpoint working
- [ ] Image resizing and WebP conversion working
- [ ] Avatar crop modal functional
- [ ] Delete avatar functionality working
- [ ] Supabase Storage bucket configured for avatars
- [ ] Email verification emails sent for email changes
- [ ] Real-time UI updates after profile changes
- [ ] Unit tests written (email validation, file size checks)
- [ ] Integration tests passing (profile update flow)
- [ ] E2E test passing (Playwright: update profile)
- [ ] Accessibility: Form labels, keyboard navigation
- [ ] Mobile responsive
- [ ] Code review approved
- [ ] Deployed to staging and verified
