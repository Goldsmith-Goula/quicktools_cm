# QuickTools CM — Complete UI Design Specification
This document provides a highly detailed, comprehensive UI/UX specification of the **QuickTools CM** application. It has been structured for consumption by UI design generation tools like Google Project Stitch to reconstruct the exact visual layout, component styling, interactions, and color palettes of the React Native application.

---

## 🎨 1. Brand & Design Tokens

### 🌈 Color Palette (Tailored HSL-equivalent Hex Codes)
*   **Primary (Brand Blue):** `#0056C6` — Used for main buttons, primary headers, active tab indicators, and primary branding.
*   **Accent (Success Green):** `#2E7D32` — Used for WhatsApp screen actions, successful validations, and active indicators.
*   **Base Black:** `#0B121F` — Sleek, deep dark blue-grey for maximum text readability and dark UI components.
*   **Danger Red:** `#D32F2F` — Used for warnings, trash icons, delete actions, and danger settings.
*   **Light Gray:** `#F3F4F6` — For input borders, unselected tab chips, and card borders.
*   **Very Light Gray:** `#FAFAFA` — Page background color for clean, soft contrast.
*   **Overlay (Modal Backdrop):** `rgba(11, 18, 31, 0.4)` — Semitransparent dark screen dimming for modal viewports.

#### 📡 Carrier-Specific Branding Colors
*   **MTN Yellow:** `#FFCC00` (Yellow with high contrast black text for MTN Cameroon codes)
*   **Orange:** `#FF6600` (Vibrant orange for Orange Cameroun codes)
*   **Camtel Blue:** `#0099FF` (Light electric blue for Camtel codes)

### 📐 Spacing & Elevation System
*   **Border Radiuses:**
    *   Large Modals/Sheets: `16px`
    *   Content Cards, Settings rows, and Search input: `12px`
    *   Buttons, Chips, and Input fields: `8px`
    *   FAB Button: `28px` (perfect circle of diameter `56px`)
*   **Shadows (Ambient Elevation):**
    *   *Low Card Elevation:* `shadowColor: #0B121F`, offset `(0, 1)`, opacity `0.05`, radius `2px`, elevation `1`.
    *   *High Modal/FAB Elevation:* `shadowColor: #0B121F`, offset `(0, 3)`, opacity `0.2`, radius `4px`, elevation `4`.

### 🔠 Typography
*   **Primary Font:** Inter, Outfit, or standard system sans-serif (clean, high-density readability).
*   **Monospace Font:** Courier / monospace (exclusively for USSD code sequences like `*170*0#` to stand out).
*   **Text Hierarchies:**
    *   `Display/Title:` `18px`, Bold, `#0B121F`
    *   `Card Title:` `14px`, Bold, `#0B121F`
    *   `USSD Code Code:` `24px` (AI Card) / `18px` (Standard Card), Bold, Monospace, `#0056C6`
    *   `Body/Description:` `12px` to `13px`, Regular, line-height `18px`, `#6B7280` (gray)
    *   `Sub-labels/Counters:` `10px` to `11px`, Regular/Semi-bold, `#6B7280`

---

## 🏛️ 2. Global Layout & Navigation

### 📱 2.1 Tab Navigation
The app consists of three main dashboard views controlled by a bottom-tab navigator or top-level tabs.
1.  **USSD Smart Hub** (`ussd`): Offline & Crowdsourced USSD directory.
2.  **WhatsApp Quick Chat** (`whatsapp`): Message logs and non-contact chat creator.
3.  **Applet Settings** (`settings`): Configuration, direct prefix selectors, and cache manager.

### 🏷️ 2.2 Shared Header Bar
*   **Height:** `60px`
*   **Background:** `#FFFFFF` with a bottom border `1px` of `#F3F4F6`.
*   **Left-Aligned Section:**
    *   **Brand Icon Block:** A `32px` square block with `8px` rounded corners.
        *   *For USSD/Settings:* Background `#0056C6` (Primary Blue). Text inside: `"US"` or `"ST"` in white, bold, `14px`.
        *   *For WhatsApp:* Background `#2E7D32` (Green). Text inside: `"WA"` in white, bold, `14px`.
    *   **Tab Title:** `18px` bold, `#0B121F` (Dynamic text: `"USSD Smart Hub"`, `"WhatsApp Quick Chat"`, or `"Applet Settings"`).
*   **Right-Aligned Section (USSD Screen Only):**
    *   **Favorite Badge Button:** A `38px` square light gray (`#F3F4F6`) icon button with `8px` rounded corners holding a red/blue heart icon (`Ionicons` `heart`, size `18`). Tapping this launches the *Favorites Modal*.

---

## 🖥️ 3. Screen Specs

### 🔍 3.1 USSD Smart Hub Screen (`UssdScreen.js`)

#### 1. Search Section
*   **Height:** `48px` with `12px` rounded corners.
*   **Background:** `#F3F4F6`. Horizontal padding: `12px`.
*   **Layout:**
    *   Left: Search magnifying glass icon (`Ionicons` `search`, size `16`, color `#6B7280`).
    *   Center: Text Input with placeholder: `"Search check balance, buy data bundles..."` in `#6B7280`. Text color: `#0B121F`.
    *   Right: If search query has length > 0, display a clear button (`Ionicons` `close-circle`, size `16`, color `#6B7280`).

#### 2. Horizontal Filter Chips Row
*   **Height:** `46px`.
*   **List Layout:** Horizontal scrollbar hidden.
*   **Chip Items:** `All`, `Balance`, `Data`, `Airtime`, `Mobile Money`, `Special`.
    *   **Inactive Chips:** Padding `14px` x `7px`, background `#F3F4F6`, rounded corners `8px`, text color `#0B121F` (`12px`, semi-bold).
    *   **Active Chip:** Background `#0056C6` (Primary Blue). Text color: `#FFFFFF` (`12px` bold).

#### 3. List Content State
*   **USSD Card List (Populated State):**
    *   List has a padding-bottom of `80px` to clear the Floating Action FAB.
    *   Each row renders an `UssdCard` (see Component Specs).
*   **Empty State with "Ask Gemini AI" Card:**
    *   Triggered when no matching codes are found in local memory.
    *   **AI Error Card:** If a network or parsing failure occurs, a `#FEE2E2` light red box with a `#DC2626` red border and matching icon appears at the top.
    *   **AI Suggestion Card:** Renders a gorgeous purple card when Gemini provides a result:
        *   *Background:* `#F3E8FF` (soft light purple) with `#D8B4FE` purple borders.
        *   *Header Row:* Sparkles icon (`Ionicons` `sparkles`, size `16`, color `#7C3AED`), bold violet label: `"AI Suggestion"`. The right side displays a purple network tag with white text (e.g. `MTN` or `ORANGE`).
        *   *Code:* `24px` bold black text (`#0B121F`) displaying the sequence (e.g., `*157#`).
        *   *Name:* `14px` bold black text.
        *   *Description:* `12px` dark-gray description of the action.
        *   *Confidence Stars:* Row of `5` stars (`Ionicons` `star` or `star-outline`), colored yellow-gold `#F59E0B`, followed by a `"XX% confidence"` caption.
        *   *Actions Row:* Two side-by-side buttons:
            1.  **Dial Button:** Violet background `#7C3AED` with a telephone phone icon and text `"Dial"`.
            2.  **Save Button:** Emerald green background `#059669` with an add icon and text `"Save"`. Tapping this opens the *Submit Code Registry Modal* prefilled with the AI suggestion data.
    *   **Offline Fallback Layout:** Displays an open folder icon (`Ionicons` `folder-open-outline`, size `48`, color `#6B7280`), a `"No Services Located"` label, and `"No matches for..."` caption.
    *   **"Ask Gemini AI" Button:** Purple pill-button (`#7C3AED`), height `44px`, displaying sparkles icon and text `"Ask Gemini AI"` in white.
    *   **"Add Custom Code" Button:** Primary blue button below the offline layout, height `38px`, text `"Add Custom Code"`.

#### 4. Floating Action Button (FAB)
*   **Position:** Absolute positioned at `bottom: 20px`, `right: 20px`.
*   **Size:** `56px` diameter circle.
*   **Style:** Background `#0056C6` (Primary Blue). Center icon: `+` plus symbol (`Ionicons` `add`, size `24`, white).
*   **Elevation:** Strong shadow offset `(0, 3)`, shadow opacity `0.2`, radius `4px`, elevation `4`.

---

### 💬 3.2 WhatsApp Quick Chat Screen (`WhatsAppScreen.js`)

#### 1. Form Inputs Section
*   **Description Text:** `13px` light gray informative paragraph detailing rapid contact-free messaging.
*   **Country Registry Selector:**
    *   Style: A row with height `48px`, background `#F3F4F6`, border-radius `8px`.
    *   Layout: Displays country flag (e.g., `"🇨🇲"`), name and dial code (e.g., `"Cameroon (+237)"`), and a small downward arrow (`"▼"`) on the right. Tapping opens the *Country Modal*.
*   **Phone Number Input:**
    *   Style: Height `48px`, border-radius `8px`, border `1px` `#F3F4F6`, background `#FFFFFF`.
    *   Layout: Shows static prefix bold text (e.g., `"+237"`) on the left, an editable text field `656 123 456` with numeric keypad, and a round gray close button `✕` on the right if digits are present.
    *   *Validation Label:* Renders `"✓ Format is complete & valid"` in Green (`#2E7D32`) when phone length is `9` to `15` digits. Otherwise, shows `"✗ Format requires 9 to 15 digits"` in Red (`#D32F2F`).
*   **Custom Attached Message Textarea:**
    *   Style: Multiline input, height `100px`, vertical top alignment, border `1px` `#F3F4F6`, background `#FFFFFF`, rounded corners `8px`, padding `10px` x `12px`.
    *   *Character Counter:* Bottom-right subtext: `"{length}/1000"`.
*   **Quick Message Chips:**
    *   A horizontal wrapped row of quick text tags: `Bonjour! 😊`, `Greetings! 🤝`, `Need Support! 📢`. Clicking a chip automatically populates the text area.

#### 2. WhatsApp Trigger Action Buttons
*   **"Invoke WhatsApp Chat" (Primary):** Height `48px`, border-radius `8px`. If valid, background `#2E7D32` (Green); if invalid, disabled and background `#6B7280`. Displays `"chatbubbles"` icon and white bold text.
*   **"Generate Contact QR Code" (Outline):** Height `48px`, border-radius `8px`, border `1px` matching validation color (Green or Gray). Displays `"qr-code"` icon.

#### 3. Recent Outgoing Chats List
*   **Header:** Dynamic title `"Recent Outgoing Chats ({Count})"` in bold black. On the right, a red `"Wipe Recents"` text button is shown if history is populated.
*   **Empty State:** A simple card with height `80px`, white background, border `1px` `#F3F4F6`, showing a gray label indicating no outgoing chat history is currently logged.
*   **History List Wrapper:** A rounded `12px` box with border `#F3F4F6` and hidden overflow to crop list item corners.
    *   **Recent Item Row:** Row layout, border-bottom `1px` `#F3F4F6`.
        *   Left: Big country flag emoji (`24px`).
        *   Middle: Bold phone number header (e.g., `+237 670 123 456`), message excerpt (`11px` gray text, restricted to 1 line with ellipsis), and timestamp.
        *   Right: Trash button (`Ionicons` `trash-outline`, size `18`, color `#D32F2F`) to delete a single history item.

---

### ⚙️ 3.3 Applet Settings Screen (`SettingsScreen.js`)

#### 1. Menu Preferences List
*   **Preferred Telephony Network Card:**
    *   Style: White background row, rounded `10px`, padding `14px`, border `1px` `#F3F4F6`.
    *   Layout: Displays title `"Preferred Telephony Network"`, subtext showing the current choice (e.g., `MTN`), and a rightward arrow chevron (`"➔"`). Tapping opens the *Network Modal*.
*   **Standard Country DirectPrefix Card:**
    *   Style: Same white card row.
    *   Layout: Title `"Standard Country DirectPrefix"`, subtext showing flag and prefix code (e.g., `🇨🇲 Cameroon (+237)`), and chevron. Opens the *Country Modal*.
*   **Database Scrub Row (Dangerous Zone):**
    *   Style: Soft red background `rgba(211, 47, 47, 0.04)` with a red border `rgba(211, 47, 47, 0.15)`, rounded `10px`, padding `14px`.
    *   Layout: Displays title `"Inbound DB Scrub (Clear Cache)"` in bold red, dangerous warning details in soft red, and a delete close symbol `✕` on the right. Opens the *Reset Confirmation Modal*.

#### 2. About Info Plate Card
*   **Style:** Colored card styled in soft primary blue tint `rgba(0, 86, 198, 0.05)`, border `1px` `rgba(0, 86, 198, 0.1)`, rounded corners `12px`, padding `16px`.
*   **Details:** Bold primary blue title `"QuickTools CM ReactNative"`, version subtitle, and credits describing application architecture, 24-hr local rate-limit rules, and offline data sync.

---

## 📂 4. Component & Modal Specs

### 🗃️ 4.1 USSD Code Card Component (`UssdCard.js`)
*   **Layout:** White background container, rounded `12px`, padding `14px`, border `1px` `#F3F4F6`. Ambient low shadow elevation.
*   **Top Row:**
    *   Left: Bold title (e.g. `"Internet Balance"`) in `#0B121F` (`14px` bold, 1-line truncation).
    *   Right: Network and status tags:
        *   *If Community Code:* Violet tag `#7C3AED` with white text: `"COMMUNITY"`.
        *   *Carrier Tag:* Colored tag with white uppercase carrier code (e.g., `MTN` in Yellow `#FFCC00`, `ORANGE` in Orange `#FF6600`, or `CAMTEL` in Light Blue `#0099FF`).
*   **Middle Code Section:**
    *   Dynamic code text (e.g., `*157#`) rendered in monospace font, size `18px`, bold, primary blue (`#0056C6`).
*   **Description Section:**
    *   Action description (`11px` gray text, max 2 lines with ellipsis).
*   **Bottom Actions Row:**
    *   **Dial Button:** Left-aligned, flexible blue button (`#0056C6`), height `38px`, displaying white call icon and `"Dial"`.
    *   **Copy Button:** Middle-aligned, flexible light-gray button (`#F3F4F6`), height `38px`, displaying copy icon and `"Copy"` in black.
    *   **Favorite Heart Button:** Small gray icon button (`#F3F4F6`), `38px` square, containing a red/blue heart outline/filled icon.
    *   **Delete Button (User/Custom entries only):** Small light-gray icon button containing trash icon in red (`#D32F2F`).

---

### 🪟 4.2 Dynamic Bottom-Sheet & Modal Dialogs (`CustomModals.js`)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Submit Code Registry Modal (Bottom Sheet Slide-Up)        │
│                                                             │
│ Service Name:  [ Check Internet Data bundle           ]     │
│ USSD Sequence: [ *146*2#                              ]     │
│ Carrier:       [ MTN (Active) ] [ Orange ] [ Camtel ]       │
│ Category:      [ Balance ] [ Data (Active) ] [ Airtime ]... │
│ Description:   [ Description of USSD action           ]     │
│                                                             │
│ ⚠️ Rate-Limit Notice: Max 3 entries / rolling 24-hours.     │
│ [=========== VERIFY AND SUBMIT REGISTRY ===========]        │
└─────────────────────────────────────────────────────────────┘
```

#### 1. Submit Code Registry Modal (`SubmitModal`)
*   **Type:** Bottom-sheet style modal. Transitions slide-up from bottom.
*   **Visual Layout:**
    *   Top: Header row with `"Submit Code Registry"` bold title and close `✕` icon.
    *   Body (Scrollable):
        1.  *Service Name Field:* TextInput (`#F3F4F6` background, rounded `8px`, `44px` height).
        2.  *USSD Sequence Field:* TextInput with monospace behavior.
        3.  *Cell Provider Picker:* Horizontal selector row. Items MTN, Orange, Camtel:
            *   *Active Carrier:* Solid primary blue background `#0056C6` with white text.
            *   *Inactive Carrier:* Light gray background with black text.
        4.  *Category Scroll Row:* Horizontal scrolling chips of categories: `Balance`, `Data`, `Airtime`, `Mobile Money`, `Special`. Active categories have blue background.
        5.  *Description Area:* Multiline input area (height `64px`, vertical top alignment).
        6.  *Throttling Warning Card:* Pale orange banner `#FFFBEB` with deep orange border `#FEF3C7`, warning icon, and rate-limit explanation.
    *   Bottom Button: `"Verify And Submit Registry"` bold button, height `48px` in primary blue.

#### 2. Saved Favorites Modal (`FavoritesModal`)
*   **Type:** Bottom-sheet modal (slide-up).
*   **Layout:**
    *   Top: Title `"Saved Favorites"` accompanied by a red/blue heart icon. Right-aligned close button.
    *   Body:
        *   *If Empty:* Large heart icon and message: `"Favorites list empty. Tap the heart icon..."`
        *   *If Populated:* Row items showing name, code, carrier, a blue `"Call"` dial button, and a red `"heart-dislike"` icon button to unfavorite.

#### 3. Country Entry Modal (`CountryModal`) & Network Modal (`NetworkModal`)
*   **Type:** Center-aligned popup dialog overlay. Background dimmed by overlay.
*   **Card Wrapper:** Width `85%`, white background, `16px` border-radius, padded, deep shadow.
*   **Layout:**
    *   Title: Bold center-aligned header.
    *   Rows: List of countries (Cameroon, Nigeria, Gabon, Equatorial Guinea, Chad) with flags and codes. Active items show a checkmark `✓` icon.
    *   Cancel Button: Bottom primary blue text button `"Cancel"`.

#### 4. WhatsApp QR Inviter Modal (`QrCodeModal`)
*   **Type:** Center-aligned dialog card.
*   **Visual Layout:**
    *   Header: QR code icon and title `"WhatsApp QR Inviter"`.
    *   Body: Informational gray text, followed by a center-aligned **QR Code Frame**:
        *   *Frame:* `200px` square white block with `#F3F4F6` border.
        *   *QR Image:* Renders a `180px` square QR code generated dynamically from API URL.
    *   Subtext: Bold target phone endpoint.
    *   Share Button: Solid blue button `"Share Link Target"`.
    *   Close Button: Bold gray text button `"Close Viewer"`.

#### 5. Cache Scrub Confirmation Modal (`ResetConfirmModal`)
*   **Type:** Center-aligned warning dialog.
*   **Visual Layout:**
    *   Header: Yellow/Red warning icon with title `"Scrub Local Caches?"` in red.
    *   Description: Warning details on data erasure in gray.
    *   Action Buttons:
        1.  **Scrub Button:** High-visibility red button `#D32F2F` with white text: `"Confirm Scrubbing Operation"`.
        2.  **Cancel Button:** Gray text button.
