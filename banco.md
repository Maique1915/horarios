## Table `courses`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `modalities` | `text` |  Nullable |
| `periods` | `int4` |  Nullable |
| `campus` | `text` |  Nullable |
| `activies` | `bool` |  Nullable |
| `shift` | `text` |  Nullable |
| `code` | `varchar` |  |
| `name` | `varchar` |  |
| `id` | `int4` | Primary |
| `workload` | `int4` |  Nullable |
| `university_id` | `int8` |  Nullable |
| `needs_complementary_activities` | `bool` |  Nullable |
| `credit_categories` | `jsonb` |  Nullable |

## Table `subject_requirements`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `subject_id` | `int4` |  |
| `type` | `varchar` |  |
| `prerequisite_subject_id` | `int4` |  Nullable |
| `min_credits` | `int4` |  Nullable |
| `id` | `int4` | Primary |

## Table `days`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `name` | `varchar` |  Unique |
| `id` | `int4` | Primary |

## Table `time_slots`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `start_time` | `time` |  |
| `end_time` | `time` |  |
| `id` | `int4` | Primary |
| `course_id` | `int4` |  Nullable |

## Table `classes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `start_real_time` | `time` |  Nullable |
| `end_real_time` | `time` |  Nullable |
| `subject_id` | `int4` | Primary |
| `day_id` | `int4` | Primary |
| `time_slot_id` | `int4` | Primary |
| `class` | `text` |  Nullable |

## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `is_paid` | `bool` |  Nullable |
| `subscription_expires_at` | `timestamptz` |  Nullable |
| `username` | `varchar` |  Unique |
| `password_hash` | `text` |  |
| `name` | `varchar` |  Nullable |
| `role` | `varchar` |  |
| `id` | `int4` | Primary |
| `active` | `bool` |  Nullable |
| `created_at` | `timestamp` |  Nullable |
| `course_id` | `int4` |  Nullable |

## Table `user_courses`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `int4` | Primary |
| `course_id` | `int4` | Primary |

## Table `subjects`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `workload` | `int4` |  Nullable |
| `category` | `varchar` |  Nullable |
| `course_id` | `int4` |  |
| `semester` | `int4` |  Nullable |
| `name` | `varchar` |  |
| `active` | `bool` |  Nullable |
| `acronym` | `text` |  Nullable |
| `optional` | `bool` |  Nullable |
| `id` | `int4` | Primary Identity |
| `credits` | `_int4` |  Nullable |

## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `full_name` | `text` |  Nullable |
| `payment_status` | `text` |  Nullable |
| `role` | `text` |  Nullable |

## Table `completed_subjects`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `int4` | Primary |
| `subject_id` | `int4` | Primary |
| `completed_at` | `timestamp` |  Nullable |

## Table `complementary_activities`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `group` | `bpchar` |  |
| `code` | `varchar` |  |
| `description` | `text` |  |
| `workload_formula` | `text` |  Nullable |
| `limit_hours` | `int4` |  Nullable |
| `requirements` | `text` |  Nullable |
| `active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `course_id` | `int4` |  |

## Table `user_complementary_activities`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `user_id` | `int8` |  |
| `activity_id` | `int8` |  Nullable |
| `description` | `text` |  Nullable |
| `hours` | `numeric` |  Nullable |
| `semester` | `varchar` |  Nullable |
| `document_link` | `text` |  Nullable |
| `status` | `varchar` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `current_enrollments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `int8` |  |
| `subject_id` | `int8` |  |
| `class_name` | `text` |  Nullable |
| `semester` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `id` | `int8` | Primary Identity |
| `schedule_data` | `jsonb` |  Nullable |
| `course_id` | `int4` |  |

## Table `comments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `user_id` | `uuid` |  |
| `content` | `text` |  |
| `rating` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `complementary_activity_groups`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `bpchar` | Primary |
| `description` | `text` |  |
| `max_hours` | `int4` |  |
| `min_hours` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `course_id` | `int4` | Primary |

## Table `subject_equivalencies`

Tabela única para mapear equivalências. Suporta 1:1 e N:1 através de grupos.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `course_id` | `int4` |  Nullable |
| `target_subject_id` | `int4` |  |
| `source_subject_id` | `int4` |  |
| `id` | `int4` | Primary |
| `created_at` | `timestamptz` |  |

## Table `universities`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `name` | `text` |  Unique |
| `created_at` | `timestamptz` |  Nullable |

## Table `course_workloads`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `course_id` | `int4` |  Nullable |
| `type` | `text` |  |
| `min_credits` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `min_hours` | `int4` |  Nullable |

## Table `periods`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `university_id` | `int4` |  |
| `code` | `text` |  |
| `start_date` | `date` |  |
| `end_date` | `date` |  |
| `id` | `int4` | Primary |

## Table `notifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `category` | `text` |  |
| `target_type` | `text` |  |
| `subtitle` | `text` |  Nullable |
| `body` | `text` |  Nullable |
| `banner_url` | `text` |  Nullable |
| `target_id` | `int4` |  Nullable |
| `action_type` | `text` |  Nullable |
| `action_value` | `text` |  Nullable |
| `expires_at` | `timestamptz` |  Nullable |
| `is_active` | `bool` |  |
| `is_pinned` | `bool` |  |
| `priority` | `int4` |  |
| `published_at` | `timestamptz` |  |
| `created_at` | `timestamptz` |  Nullable |
| `id` | `int4` | Primary Identity |
| `title` | `text` |  |

## Table `notification_reads`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `int4` | Primary |
| `notification_id` | `int4` | Primary |
| `read_at` | `timestamptz` |  Nullable |

