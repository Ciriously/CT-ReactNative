# 📊 CleverTap Event Documentation

Below is the complete schema of CleverTap events implemented in the application.

## 1. Core App Flow & Identity

| Event Name              | Trigger Location           | Properties Sent                                                 | Purpose                                                                        |
| :---------------------- | :------------------------- | :-------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| **`MainScreen Viewed`** | `Dashboard.tsx` (On Load)  | `Name` (User's Name)                                            | Tracks Daily Active Users (DAU) and dashboard engagement frequency.            |
| **`User Logout`**       | `ProfileScreen.tsx`        | _(None)_                                                        | Tracks session end and churn risk.                                             |
| **`Profile Push`**      | `ProfileScreen.tsx` (Save) | `Name`, `Phone`, `DOB`, `MSG-email`, `MSG-push`, `MSG-whatsapp` | **User Profile Update:** Updates demographics and communication opt-in status. |

## 2. Content Discovery (Dashboard)

| Event Name            | Trigger Location           | Properties Sent                                                                              | Purpose                                                                                                    |
| :-------------------- | :------------------------- | :------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| **`Banner Clicked`**  | `BannerCarousel.tsx`       | `Movie` (Title), `Genre`                                                                     | Measures the effectiveness of the top Hero Banner in driving traffic.                                      |
| **`Poll Voted`**      | `MoviePoll.tsx`            | `Question`, `SelectedMovie`, `PreferredGenre`, `Date`                                        | **Engagement:** Captures user preferences (e.g., "Action vs Drama") to segment users for future campaigns. |
| **`Product Clicked`** | `StandardCard.tsx`         | `...movie` (Full Object), `ClickSource: 'Standard Grid'`, `Timestamp`                        | Tracks which movies are clicked from the standard horizontal rails.                                        |
| **`Product Clicked`** | `ContinueWatchingCard.tsx` | `...movie` (Full Object), `ClickSource: 'Continue Watching'`, `Action: 'Resume'`, `Progress` | **Retargeting:** Identifies users resuming content vs. starting new content.                               |

## 3. Product Engagement (Details Page)

| Event Name           | Trigger Location                   | Properties Sent                                                                            | Purpose                                                                              |
| :------------------- | :--------------------------------- | :----------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **`Product Viewed`** | `MovieDetailsScreen.tsx` (On Load) | `...movie` (Full Object), `ViewedAt`                                                       | **Core Metric:** Counts total views for a specific title. Used for "Trending" logic. |
| **`Product Action`** | `MovieDetailsScreen.tsx` (Buttons) | `ActionType` ('Play', 'Download', 'Rate', 'Share', 'Add to List'), `MovieTitle`, `MovieID` | **Conversion:** Tracks specific intent actions on the details page.                  |

---

## 📝 User Profile Properties (User Attributes)

These properties are stored directly on the user's profile, not as events.

| Property Name         | Source              | Type                  | Description                                                                           |
| :-------------------- | :------------------ | :-------------------- | :------------------------------------------------------------------------------------ |
| **`Interest_Genres`** | `MoviePoll.tsx`     | `Multi-Value (Array)` | Appends genres (e.g., "Action") to the user's interest list when they vote in a poll. |
| **`Name`**            | `ProfileScreen.tsx` | `String`              | User's full name.                                                                     |
| **`Phone`**           | `ProfileScreen.tsx` | `String`              | User's contact number.                                                                |
| **`MSG-push`**        | `ProfileScreen.tsx` | `Boolean`             | Push Notification Opt-in status.                                                      |
| **`MSG-email`**       | `ProfileScreen.tsx` | `Boolean`             | Email Opt-in status.                                                                  |
