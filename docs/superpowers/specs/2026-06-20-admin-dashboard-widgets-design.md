# Admin Dashboard Widgets Design

## Context
The Admin Dashboard currently lacks full implementations for its internal widgets. The backend endpoint (`/api/admin/stats`) has been updated to provide fully structured data for "Aktivitas Terbaru", "Performa Tutor Terbaik", and "Mata Kuliah Populer". The goal is to update the frontend `AdminDashboard.tsx` to display this data appropriately.

## Layout Changes
The dashboard uses a CSS Grid layout.
- **Left Column (Span 2):**
  - **Top:** "Aktivitas Terbaru" card spanning full width of the left column.
  - **Bottom:** A nested grid (2 columns) displaying the "Performa Tutor Terbaik" card on the left and "Mata Kuliah Populer" card on the right.
- **Right Column (Span 1):**
  - Continues to display existing "Manajemen Tutor" and "Komplain Baru" cards.

## Component Specifications

### 1. Aktivitas Terbaru (Recent Activities)
- Maps through the `stats.aktivitas_terbaru` array.
- Displays up to 5 recent events across three contexts: Tutor Applications, Bookings, and Reviews.
- **Columns:**
  - `Nama Pengguna`: Shows the user's name.
  - `Aktivitas`: Text describing the action.
  - `Waktu`: Relative time string (`time_formatted`).
  - `Status`: Colored badges based on the `type` property (`application`, `booking`, `review`).
- Displays a fallback empty state if no activities exist.

### 2. Performa Tutor Terbaik (Top Tutors)
- Maps through `stats.top_tutors` (up to 3 items).
- Each list item includes:
  - Initials extracted from the name.
  - Star rating with average number.
  - Full Name and completed sessions subtitle.
  - A "TOP TUTOR" badge with a yellow ribbon icon on the right edge.

### 3. Mata Kuliah Populer (Popular Courses)
- Maps through `stats.mata_kuliah_populer` (up to 3 items).
- Computes the percentage based on the top 3 total bookings (`(course.bookings / total_top_3_bookings) * 100`).
- Each list item includes:
  - Course Name and Percentage label text.
  - A visual progress bar filled according to the computed percentage.
  - Predefined distinct colors for the progress bars (e.g., brand/blue, emerald, amber).

## Data Fetching
- The data is already fetched natively via `adminService.getStats()`.
- Data arrays safely fallback to `[]` when rendering.

## Testing & Fallbacks
- Loading skeletons or `...` will be displayed while waiting for the data.
- If arrays are empty, display graceful fallback UI elements.
