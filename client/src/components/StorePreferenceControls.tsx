import { Languages } from "lucide-react";
import { useStorePreferences, type StoreCurrency, type StoreLanguage } from "@/contexts/StorePreferencesContext";

export default function StorePreferenceControls({ compact = false }: { compact?: boolean }) {
  const { language, currency, languageLabels, currencyLabels, setLanguage, setCurrency, isRatesLoading } = useStorePreferences();
  return <div className={`preference-controls ${compact ? "is-compact" : ""}`} aria-label="Language and currency preferences"><label title="Language"><Languages size={14} /><select aria-label="Language" value={language} onChange={(event) => setLanguage(event.target.value as StoreLanguage)}>{Object.entries(languageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label title="Currency"><select aria-label="Currency" value={currency} onChange={(event) => setCurrency(event.target.value as StoreCurrency)} disabled={isRatesLoading}>{Object.entries(currencyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>;
}
