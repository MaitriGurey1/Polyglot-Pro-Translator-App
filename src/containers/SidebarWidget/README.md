# SidebarWidget - Translation Sidebar Component

A modular, well-architected translation sidebar widget for Contentstack with AI-powered features.

## 📁 Directory Structure

```
SidebarWidget/
├── types.ts                          # TypeScript type definitions
├── constants.ts                      # Configuration constants
├── translationApi.ts                 # API integration (Gemini, Contentstack)
├── fieldHelpers.ts                   # Field extraction and manipulation utilities
│
├── components/                       # UI Components
│   ├── index.ts                      # Component exports
│   ├── Header.tsx                    # App header with config status
│   ├── TranslationStatusDashboard.tsx # Translation progress display
│   ├── AIQualityCheck.tsx            # AI quality analysis interface
│   ├── AIToneRefinement.tsx          # AI tone refinement interface
│   ├── LanguageSelector.tsx          # Target language selection
│   ├── FieldSelector.tsx             # Translatable field selection
│   └── TranslationActions.tsx        # Translation start button & errors
│
├── hooks/                            # Custom React hooks
│   ├── index.ts                      # Hook exports
│   ├── useTranslationConfig.ts       # Extract translation configuration
│   ├── useStackLocales.ts            # Fetch and manage locales
│   ├── useEntryFields.ts             # Load entry data and fields
│   ├── useTranslation.ts             # Translation orchestration
│   └── useAIFeatures.ts              # AI features (analysis, refinement)
│
├── EntrySidebar.tsx                  # Main component (refactored)
├── EntrySidebar.old.tsx              # Original component (backup)
├── EntrySidebar.css                  # Component styles
└── README.md                         # This file
```

## 🏗️ Architecture

### Component Hierarchy

```
EntrySidebarExtension
├── Header
├── TranslationStatusDashboard
├── AIQualityCheck
├── AIToneRefinement
├── LanguageSelector
└── FieldSelector
└── TranslationActions
```

### Data Flow

```
App SDK & Config
      ↓
Custom Hooks (useTranslationConfig, useStackLocales, etc.)
      ↓
Main Component State
      ↓
UI Components (Props)
      ↓
User Actions
      ↓
API Calls (translationApi.ts)
      ↓
State Updates
      ↓
UI Re-render
```

## 🎯 Key Features

### 1. **Multi-Language Translation**
- Select multiple target languages
- Automatic entry localization
- Progress tracking per language

### 2. **Smart Field Detection**
- Extracts translatable fields from schema
- Supports nested fields (groups, global fields, modular blocks)
- Auto-selects common fields (title, description, etc.)

### 3. **AI Quality Check**
- Analyzes tone, complexity, SEO readiness
- Provides actionable suggestions
- Uses Google Search for context

### 4. **AI Tone Refinement**
- Professional/Casual/Academic tones
- Rewrites content maintaining meaning
- Preview before applying

## 📦 Usage

### Main Component

```tsx
import EntrySidebarExtension from './EntrySidebar';

// Rendered by App.tsx based on route
<Route path="/entry-sidebar" element={<EntrySidebarExtension />} />
```

### Using Custom Hooks

```tsx
import { useTranslationConfig, useStackLocales } from './hooks';

const MyComponent = () => {
  const config = useTranslationConfig(appSDK, appConfig);
  const { locales, toggleLocale } = useStackLocales(appSDK);
  
  // ... rest of component
};
```

### Using Components

```tsx
import { Header, LanguageSelector } from './components';

<Header 
  currentLocaleDisplay="English (US)"
  hasApiKey={true}
  hasManagementToken={true}
/>

<LanguageSelector
  locales={locales}
  currentLocale="en-us"
  onToggleLocale={handleToggle}
/>
```

### Using API Functions

```tsx
import { translateText, updateLocalizedEntry } from './translationApi';

const translated = await translateText(
  "Hello world",
  { code: "fr-fr", name: "French", flag: "🇫🇷" },
  config
);

const success = await updateLocalizedEntry(
  entryUid,
  contentTypeUid,
  "fr-fr",
  { title: translated },
  config
);
```

## 🔧 Configuration

### Environment Variables

Set in `.env` file:

```bash
VITE_CONTENTSTACK_API_BASE_URL=https://eu-api.contentstack.com
VITE_GEMINI_DEFAULT_MODEL=gemini-2.5-flash
```

### App Configuration

Required in Contentstack App Configuration:

- `gemini_api_key` - Gemini API key
- `gemini_model` - AI model selection (optional)
- `management_token` - Contentstack management token

## 🧪 Testing

### Unit Tests

```bash
# Test utilities
npm test fieldHelpers.test.ts
npm test translationApi.test.ts

# Test hooks
npm test useTranslation.test.ts
npm test useAIFeatures.test.ts

# Test components
npm test Header.test.tsx
npm test LanguageSelector.test.tsx
```

### Integration Tests

```bash
npm test EntrySidebar.integration.test.tsx
```

## 🎨 Styling

Styles are defined in `EntrySidebar.css` and inline styles for component-specific customization.

### Color Palette

- Primary: `#6366f1` (Indigo)
- Success: `#059669` (Green)
- Warning: `#eab308` (Yellow)
- Error: `#dc2626` (Red)
- Neutral: `#6b7280` (Gray)

## 📚 API Reference

### Types

See `types.ts` for all type definitions:
- `LocaleInfo`, `FieldInfo`, `TranslationStatus`, `TranslationConfig`, etc.

### Constants

See `constants.ts` for all constants:
- `LOCALE_DISPLAY_NAMES`, `TRANSLATABLE_DATA_TYPES`, `SYSTEM_FIELDS`, etc.

### Hooks

See `hooks/` directory:
- `useTranslationConfig()` - Extract configuration
- `useStackLocales()` - Manage locales
- `useEntryFields()` - Manage entry fields
- `useTranslation()` - Execute translations
- `useAIFeatures()` - AI analysis/refinement

### Components

See `components/` directory for all UI components and their props.

## 🐛 Troubleshooting

### Issue: "API key not configured"
**Solution**: Add Gemini API key in App Configuration

### Issue: "Management Token not configured"
**Solution**: Add management token in App Configuration

### Issue: "No locales loading"
**Solution**: Check stack has locales configured

### Issue: "Fields not detected"
**Solution**: Ensure content type has translatable fields (text, markdown, etc.)

## 🚀 Performance

- **Memoization**: Configuration extracted via `useMemo`
- **Code Splitting**: Components can be lazy-loaded
- **Optimized Rendering**: Small, focused components

## 🔐 Security

- API keys stored in App Configuration (not in code)
- Management token never logged in full
- Secure API calls via HTTPS

## 📖 Related Documentation

- [Contentstack App SDK](https://www.contentstack.com/docs/developers/app-sdk/)
- [Gemini API](https://ai.google.dev/gemini-api/docs)
- [React Hooks](https://react.dev/reference/react)

## 🤝 Contributing

When adding new features:

1. **Add types** to `types.ts`
2. **Add constants** to `constants.ts`
3. **Create utilities** in appropriate files
4. **Create components** in `components/`
5. **Create hooks** in `hooks/` if needed
6. **Update main component** to use new features
7. **Add tests**
8. **Update documentation**

## 📝 Changelog

### v2.0.0 - Refactored Architecture
- Split monolithic component into modular structure
- Created custom hooks for business logic
- Extracted UI into separate components
- Added comprehensive type definitions
- Improved code organization and maintainability

### v1.0.0 - Initial Release
- Basic translation functionality
- AI quality check
- AI tone refinement
- Multi-locale support

