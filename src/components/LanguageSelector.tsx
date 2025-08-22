import { memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

const LanguageSelector = memo(() => {
  const { changeLanguage, languageInfo } = useI18n();

  const languages = useMemo(() => [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
  ], []);

  const handleLanguageChange = useCallback((langCode: string) => {
    changeLanguage(langCode);
  }, [changeLanguage]);

  const getCurrentLanguage = useMemo(() => {
    return languages.find(lang => lang.code === languageInfo.current) || languages[0];
  }, [languages, languageInfo.current]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{getCurrentLanguage.name}</span>
          <span className="sm:hidden">{getCurrentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`cursor-pointer ${languageInfo.current === language.code ? 'bg-accent' : ''}`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

LanguageSelector.displayName = 'LanguageSelector';

export default LanguageSelector;