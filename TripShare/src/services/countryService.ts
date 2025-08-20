interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  cca3: string;
  idd: {
    root: string;
    suffixes: string[];
  };
  flag: string;
  flags: {
    png: string;
    svg: string;
  };
}

export interface CountryOption {
  label: string;
  value: string;
  flag: string;
  flagUrl: string;
  code: string;
  name: string;
}

class CountryService {
  private cache: CountryOption[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 heure

  async getCountries(): Promise<CountryOption[]> {
    // Vérifier le cache
    if (this.cache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      console.log('🌍 CountryService - Utilisation du cache:', this.cache.length, 'pays');
      return this.cache;
    }

    try {
      console.log('🌍 CountryService - Récupération des pays depuis l\'API...');
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag,flags');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des pays');
      }

      const countries: Country[] = await response.json();
      console.log('🌍 CountryService - Réponse API reçue:', countries.length, 'pays bruts');
      
      // Filtrer et transformer les données
      const countryOptions: CountryOption[] = countries
        .filter(country => 
          country.idd?.root && 
          country.idd?.suffixes && 
          country.idd.suffixes.length > 0
        )
        .map(country => ({
          label: `${country.flag} ${country.name.common} (${country.idd.root}${country.idd.suffixes[0]})`,
          value: `${country.idd.root}${country.idd.suffixes[0]}`,
          flag: country.flag,
          flagUrl: country.flags?.png || `https://flagcdn.com/w40/${country.cca2.toLowerCase()}.png`,
          code: country.cca2,
          name: country.name.common,
        }))
        // Supprimer les doublons basés sur le code pays pour éviter les conflits
        .filter((country, index, self) => 
          index === self.findIndex(c => c.code === country.code)
        )
        .sort((a, b) => a.label.localeCompare(b.label));

      console.log('🌍 CountryService - Pays transformés:', countryOptions.length, 'pays');
      console.log('🌍 CountryService - Premier pays:', countryOptions[0]);
      console.log('🌍 CountryService - Belgique trouvée:', countryOptions.find(c => c.code === 'BE'));

      // Mettre en cache
      this.cache = countryOptions;
      this.cacheTimestamp = Date.now();

      return countryOptions;
    } catch (error) {
      console.error('🌍 CountryService - Erreur lors de la récupération des pays:', error);
      
      // Retourner des pays par défaut en cas d'erreur
      const defaultCountries = this.getDefaultCountries();
      console.log('🌍 CountryService - Utilisation des pays par défaut:', defaultCountries.length, 'pays');
      return defaultCountries;
    }
  }

  private getDefaultCountries(): CountryOption[] {
    return [
      { label: '🇧🇪 Belgique (+32)', value: '+32', flag: '🇧🇪', flagUrl: 'https://flagcdn.com/w40/be.png', code: 'BE', name: 'Belgique' },
      { label: '🇫🇷 France (+33)', value: '+33', flag: '🇫🇷', flagUrl: 'https://flagcdn.com/w40/fr.png', code: 'FR', name: 'France' },
      { label: '🇺🇸 États-Unis (+1)', value: '+1', flag: '🇺🇸', flagUrl: 'https://flagcdn.com/w40/us.png', code: 'US', name: 'États-Unis' },
      { label: '🇬🇧 Royaume-Uni (+44)', value: '+44', flag: '🇬🇧', flagUrl: 'https://flagcdn.com/w40/gb.png', code: 'GB', name: 'Royaume-Uni' },
      { label: '🇩🇪 Allemagne (+49)', value: '+49', flag: '🇩🇪', flagUrl: 'https://flagcdn.com/w40/de.png', code: 'DE', name: 'Allemagne' },
      { label: '🇪🇸 Espagne (+34)', value: '+34', flag: '🇪🇸', flagUrl: 'https://flagcdn.com/w40/es.png', code: 'ES', name: 'Espagne' },
      { label: '🇮🇹 Italie (+39)', value: '+39', flag: '🇮🇹', flagUrl: 'https://flagcdn.com/w40/it.png', code: 'IT', name: 'Italie' },
      { label: '🇨🇦 Canada (+1)', value: '+1', flag: '🇨🇦', flagUrl: 'https://flagcdn.com/w40/ca.png', code: 'CA', name: 'Canada' },
      { label: '🇯🇵 Japon (+81)', value: '+81', flag: '🇯🇵', flagUrl: 'https://flagcdn.com/w40/jp.png', code: 'JP', name: 'Japon' },
      { label: '🇦🇺 Australie (+61)', value: '+61', flag: '🇦🇺', flagUrl: 'https://flagcdn.com/w40/au.png', code: 'AU', name: 'Australie' },
      { label: '🇧🇷 Brésil (+55)', value: '+55', flag: '🇧🇷', flagUrl: 'https://flagcdn.com/w40/br.png', code: 'BR', name: 'Brésil' },
    ];
  }

  // Méthode pour obtenir un pays spécifique par code
  async getCountryByCode(code: string): Promise<CountryOption | null> {
    const countries = await this.getCountries();
    return countries.find(country => country.value === code) || null;
  }

  // Méthode pour rechercher des pays
  async searchCountries(query: string): Promise<CountryOption[]> {
    const countries = await this.getCountries();
    const lowerQuery = query.toLowerCase();
    
    return countries.filter(country =>
      country.label.toLowerCase().includes(lowerQuery) ||
      country.code.toLowerCase().includes(lowerQuery)
    );
  }

  // Méthode pour obtenir un label adapté à la plateforme
  getDisplayLabel(country: CountryOption, platform: string = 'mobile'): string {
    if (platform === 'web') {
      // Sur web, forcer l'affichage de l'emoji avec le nom complet
      return `${country.flag} ${country.name} ${country.value}`;
    }
    // Sur mobile, garder l'emoji
    return country.label;
  }

  // Méthode pour forcer l'affichage des emojis sur web
  getWebDisplayLabel(country: CountryOption): string {
    // Utiliser des caractères unicode explicites pour forcer l'affichage
    const flagEmoji = country.flag || this.getFlagEmojiFromCode(country.code);
    return `${flagEmoji} ${country.name} ${country.value}`;
  }

  // Méthode de fallback pour générer des emojis de drapeaux
  private getFlagEmojiFromCode(countryCode: string): string {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  // Méthode de debug pour tester l'affichage
  debugEmojiSupport(): void {
    console.log('🇫🇷 Test France flag');
    console.log('🇺🇸 Test USA flag');
    console.log('🇩🇪 Test Germany flag');
    console.log('Generated FR:', this.getFlagEmojiFromCode('FR'));
    console.log('Generated US:', this.getFlagEmojiFromCode('US'));
  }
}

export const countryService = new CountryService(); 