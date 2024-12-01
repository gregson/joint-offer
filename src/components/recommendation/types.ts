export interface QuizQuestion {
  id: string;
  question: string;
  description?: string;
  options: QuizOption[];
  type: 'single' | 'multiple' | 'slider' | 'budget';
  category: 'usage' | 'performance' | 'photo' | 'budget' | 'preference';
}

export interface QuizOption {
  id: string;
  label: string;
  value: string | number;
  icon?: string;
  weight?: {
    [key: string]: number; // poids pour différents critères (performance, photo, batterie, etc.)
  };
}

export interface UserPreferences {
  budget: {
    max: number;
    upfront: number;
    monthly: number;
  };
  priorities: {
    performance: number;
    photo: number;
    battery: number;
    screen: number;
    storage: number;
  };
  usage: {
    gaming: number;
    photo: number;
    video: number;
    social: number;
    professional: number;
  };
}

export interface SmartphoneScore {
  phoneId: string;
  totalScore: number;
  scores: {
    [key: string]: number; // scores détaillés par critère
  };
  matchPercentage: number;
  reasons: string[];
}
