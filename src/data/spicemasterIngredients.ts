import { RawIngredientInput } from '../types/flavor';

// Catalogo spezie, erbe, botaniche, sali e zuccheri importato da SpiceMaster Pro
export const SPICEMASTER_INGREDIENTS: RawIngredientInput[] = [
  {
    "id": "ing_sm_s10",
    "name": "Chiodi di Garofano",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 2.6,
        "sweet": 3.4
      },
      "mouthfeel": {
        "pungency": 7.5,
        "astringency": 1.7
      },
      "aromas": {
        "spicy_phenolic": 9.8,
        "caramel_sweet": 4.1,
        "floral": 1.5,
        "earthy_mineral": 2.8
      }
    }
  },
  {
    "id": "ing_sm_s11",
    "name": "Coriandolo (semi)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sour": 3.5,
        "sweet": 1.1,
        "bitter": 0.8
      },
      "mouthfeel": {
        "astringency": 2.6
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "floral": 6.4,
        "green_herbaceous": 4.7,
        "roasted_pyrazine": 5.5,
        "caramel_sweet": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s12",
    "name": "Finocchio (semi)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 5.9,
        "bitter": 1.1,
        "sour": 1.1
      },
      "mouthfeel": {
        "astringency": 1.5
      },
      "aromas": {
        "caramel_sweet": 9.0,
        "floral": 2.0,
        "green_herbaceous": 6.4,
        "fruity_ester": 4.4,
        "roasted_pyrazine": 5.5
      }
    }
  },
  {
    "id": "ing_sm_s19",
    "name": "Ginepro (bacche)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "sour": 3.5,
        "bitter": 3.9
      },
      "mouthfeel": {
        "astringency": 4.9
      },
      "aromas": {
        "citrus_terpenic": 10.0,
        "green_herbaceous": 9.9,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s21",
    "name": "Fieno Greco (Fenugreek)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 6.1,
        "sweet": 3.4,
        "umami": 0.8
      },
      "mouthfeel": {
        "astringency": 3.5
      },
      "aromas": {
        "earthy_mineral": 6.9,
        "caramel_sweet": 7.6,
        "floral": 1.5,
        "roasted_pyrazine": 5.5
      }
    }
  },
  {
    "id": "ing_sm_s22",
    "name": "Sumac",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sour": 10.0,
        "sweet": 1.9,
        "bitter": 2.8
      },
      "mouthfeel": {
        "astringency": 7.4
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "fruity_ester": 10.0,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s23",
    "name": "Pepe Rosa",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 3.4,
        "sour": 1.5,
        "bitter": 0.8
      },
      "mouthfeel": {
        "pungency": 4.1
      },
      "aromas": {
        "floral": 8.5,
        "fruity_ester": 6.0,
        "spicy_phenolic": 3.6
      }
    }
  },
  {
    "id": "ing_sm_s24",
    "name": "Aneto",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "sour": 3.7,
        "sweet": 1.4
      },
      "mouthfeel": {
        "astringency": 3.1
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "citrus_terpenic": 6.4,
        "fruity_ester": 4.4
      }
    }
  },
  {
    "id": "ing_sm_s26",
    "name": "Za'atar",
    "category": "herb_spice",
    "composition": {
      "water": 0.1,
      "protein": 0.1,
      "carbs_sugars": 0.62,
      "fat": 0.05
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "sour": 9.1,
        "salty": 3.6,
        "umami": 1.1
      },
      "mouthfeel": {
        "astringency": 7.1
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "citrus_terpenic": 6.4,
        "fruity_ester": 4.0,
        "roasted_pyrazine": 5.5,
        "caramel_sweet": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s27",
    "name": "Sale Affumicato",
    "category": "umami_condiment",
    "composition": {
      "water": 0.01,
      "protein": 0.0,
      "carbs_sugars": 0.0,
      "fat": 0.0
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 2.0,
        "umami": 7.6,
        "salty": 10.0
      },
      "mouthfeel": {
        "crunchiness": 6.5
      },
      "aromas": {
        "spicy_phenolic": 10.0,
        "roasted_pyrazine": 10.0,
        "umami_funky": 3.9
      }
    }
  },
  {
    "id": "ing_sm_s29",
    "name": "Lavanda",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 4.0,
        "bitter": 1.1
      },
      "mouthfeel": {
        "astringency": 1.5
      },
      "aromas": {
        "floral": 9.6,
        "green_herbaceous": 6.4,
        "caramel_sweet": 3.0
      }
    }
  },
  {
    "id": "ing_sm_s30",
    "name": "Rosa Damascena",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 5.9,
        "sour": 1.5
      },
      "mouthfeel": {},
      "aromas": {
        "floral": 9.6,
        "fruity_ester": 6.0,
        "caramel_sweet": 3.0
      }
    }
  },
  {
    "id": "ing_sm_s31",
    "name": "Grani del Paradiso",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "sour": 2.6,
        "sweet": 0.8
      },
      "mouthfeel": {
        "pungency": 7.5,
        "astringency": 1.1
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "citrus_terpenic": 6.4,
        "floral": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s32",
    "name": "Cardamomo Nero",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 6.2,
        "umami": 3.1
      },
      "mouthfeel": {
        "astringency": 1.9
      },
      "aromas": {
        "spicy_phenolic": 8.5,
        "roasted_pyrazine": 6.5,
        "earthy_mineral": 7.4
      }
    }
  },
  {
    "id": "ing_sm_s33",
    "name": "Urfa Biber",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 1.5,
        "sweet": 4.4,
        "sour": 1.5
      },
      "mouthfeel": {
        "pungency": 10.0
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "fruity_ester": 9.0,
        "caramel_sweet": 3.0,
        "floral": 1.1
      }
    }
  },
  {
    "id": "ing_sm_s34",
    "name": "Macis",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 5.6,
        "bitter": 1.1
      },
      "mouthfeel": {
        "astringency": 1.7
      },
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 8.4,
        "spicy_phenolic": 3.3,
        "earthy_mineral": 2.8
      }
    }
  },
  {
    "id": "ing_sm_s35",
    "name": "Assafetida (Hing)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "umami": 8.6,
        "salty": 2.0,
        "bitter": 4.2
      },
      "mouthfeel": {
        "astringency": 1.9,
        "pungency": 4.5
      },
      "aromas": {
        "umami_funky": 7.0,
        "earthy_mineral": 7.4,
        "sulfurous": 7.5,
        "citrus_terpenic": 4.5,
        "green_herbaceous": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s36",
    "name": "Polline di Finocchio",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 5.6,
        "sour": 1.9
      },
      "mouthfeel": {
        "astringency": 0.8
      },
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 8.4,
        "citrus_terpenic": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s37",
    "name": "Pepe di Voatsiperifery",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 2.6,
        "sweet": 1.1,
        "umami": 0.8
      },
      "mouthfeel": {
        "pungency": 7.5
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "floral": 6.4,
        "earthy_mineral": 4.4
      }
    }
  },
  {
    "id": "ing_sm_s38",
    "name": "Nigella (Cumino Nero)",
    "category": "herb_spice",
    "composition": {
      "water": 0.05,
      "protein": 0.2,
      "carbs_sugars": 0.25,
      "fat": 0.45
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 7.3,
        "umami": 1.1
      },
      "mouthfeel": {
        "astringency": 4.6,
        "pungency": 4.5
      },
      "aromas": {
        "earthy_mineral": 8.5,
        "green_herbaceous": 4.7,
        "sulfurous": 7.5
      }
    }
  },
  {
    "id": "ing_sm_s39",
    "name": "Galanga (Maggiore)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 2.6,
        "sweet": 1.1
      },
      "mouthfeel": {
        "pungency": 7.5,
        "astringency": 1.7
      },
      "aromas": {
        "spicy_phenolic": 9.8,
        "floral": 6.4,
        "earthy_mineral": 2.8,
        "citrus_terpenic": 4.5,
        "green_herbaceous": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s40",
    "name": "Lemongrass",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "sour": 3.5,
        "bitter": 1.1,
        "sweet": 0.8
      },
      "mouthfeel": {
        "astringency": 3.0
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "green_herbaceous": 6.4,
        "floral": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s42",
    "name": "Dragoncello (Estragone)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 4.5,
        "bitter": 1.1,
        "sour": 1.9
      },
      "mouthfeel": {
        "astringency": 2.3
      },
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 2.0,
        "green_herbaceous": 6.4,
        "citrus_terpenic": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s43",
    "name": "Santoreggia",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 5.3
      },
      "mouthfeel": {
        "astringency": 3.9,
        "pungency": 5.6
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "spicy_phenolic": 4.9,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s46",
    "name": "Pepe Bianco",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 3.0,
        "umami": 5.2,
        "salty": 1.1
      },
      "mouthfeel": {
        "pungency": 7.5
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "earthy_mineral": 6.0,
        "umami_funky": 3.9
      }
    }
  },
  {
    "id": "ing_sm_s47",
    "name": "Pepe Verde",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 2.3,
        "sour": 2.6
      },
      "mouthfeel": {
        "pungency": 7.5,
        "astringency": 2.2
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "citrus_terpenic": 6.4,
        "green_herbaceous": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s48",
    "name": "Allspice (Pimento)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 2.6,
        "sweet": 3.4
      },
      "mouthfeel": {
        "pungency": 7.5,
        "astringency": 1.7
      },
      "aromas": {
        "spicy_phenolic": 9.8,
        "caramel_sweet": 4.1,
        "floral": 1.5,
        "earthy_mineral": 2.8
      }
    }
  },
  {
    "id": "ing_sm_s49",
    "name": "Baharat",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 2.6,
        "sweet": 3.4,
        "umami": 0.8
      },
      "mouthfeel": {
        "pungency": 7.5
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "caramel_sweet": 4.1,
        "floral": 1.5,
        "earthy_mineral": 4.4
      }
    }
  },
  {
    "id": "ing_sm_s50",
    "name": "Berbere Etiope",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "mid",
      "taste": {
        "bitter": 5.8,
        "umami": 1.1
      },
      "mouthfeel": {
        "pungency": 10.0,
        "astringency": 1.9
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "earthy_mineral": 7.4,
        "fruity_ester": 3.0,
        "citrus_terpenic": 4.5,
        "green_herbaceous": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s51",
    "name": "Sale Rosa dell'Himalaya",
    "category": "umami_condiment",
    "composition": {
      "water": 0.01,
      "protein": 0.0,
      "carbs_sugars": 0.0,
      "fat": 0.0
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "salty": 10.0,
        "umami": 3.1,
        "bitter": 1.5
      },
      "mouthfeel": {
        "crunchiness": 6.5
      },
      "aromas": {
        "earthy_mineral": 10.0,
        "marine_iodine": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s52",
    "name": "Fleur de Sel",
    "category": "umami_condiment",
    "composition": {
      "water": 0.01,
      "protein": 0.0,
      "carbs_sugars": 0.0,
      "fat": 0.0
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "salty": 10.0,
        "umami": 2.0,
        "sweet": 1.1
      },
      "mouthfeel": {
        "crunchiness": 6.5
      },
      "aromas": {
        "floral": 6.4,
        "earthy_mineral": 4.0,
        "marine_iodine": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s53",
    "name": "Zucchero di Cocco",
    "category": "umami_condiment",
    "composition": {
      "water": 0.02,
      "protein": 0.0,
      "carbs_sugars": 0.96,
      "fat": 0.0
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "finish",
      "taste": {
        "sweet": 10.0,
        "sour": 1.5,
        "bitter": 1.1,
        "umami": 0.8
      },
      "mouthfeel": {
        "richness": 3.5
      },
      "aromas": {
        "caramel_sweet": 10.0,
        "floral": 2.0,
        "fruity_ester": 6.0,
        "earthy_mineral": 4.4
      }
    }
  },
  {
    "id": "ing_sm_s55",
    "name": "Radice di Angelica",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 6.2,
        "umami": 1.5
      },
      "mouthfeel": {
        "astringency": 4.1
      },
      "aromas": {
        "earthy_mineral": 10.0,
        "spicy_phenolic": 4.5,
        "citrus_terpenic": 4.5,
        "green_herbaceous": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s56",
    "name": "Orris Root (Iris)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 4.0,
        "bitter": 1.5,
        "umami": 1.1
      },
      "mouthfeel": {},
      "aromas": {
        "floral": 9.6,
        "earthy_mineral": 6.0,
        "caramel_sweet": 3.0
      }
    }
  },
  {
    "id": "ing_sm_s57",
    "name": "Corteccia di Cassia",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "sweet": 4.5,
        "bitter": 2.2
      },
      "mouthfeel": {
        "pungency": 5.6,
        "astringency": 1.7
      },
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 2.0,
        "spicy_phenolic": 8.2,
        "earthy_mineral": 2.8
      }
    }
  },
  {
    "id": "ing_sm_s60",
    "name": "Ajowan (Trachyspermum)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 3.7,
        "umami": 0.8
      },
      "mouthfeel": {
        "pungency": 7.5,
        "astringency": 1.5
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "green_herbaceous": 6.4,
        "earthy_mineral": 4.4
      }
    }
  },
  {
    "id": "ing_sm_s61",
    "name": "Pepe Lungo",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 2.6,
        "sweet": 3.4
      },
      "mouthfeel": {
        "pungency": 7.5,
        "astringency": 1.7
      },
      "aromas": {
        "spicy_phenolic": 9.8,
        "caramel_sweet": 4.1,
        "floral": 1.5,
        "earthy_mineral": 2.8
      }
    }
  },
  {
    "id": "ing_sm_s62",
    "name": "Pepe di Timut",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "sour": 3.5,
        "sweet": 1.1,
        "bitter": 0.8
      },
      "mouthfeel": {
        "astringency": 1.5,
        "pungency": 4.1
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "floral": 6.4,
        "spicy_phenolic": 3.6
      }
    }
  },
  {
    "id": "ing_sm_s63",
    "name": "Pepe di Kampot",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 2.3,
        "sweet": 1.1
      },
      "mouthfeel": {
        "pungency": 7.5,
        "astringency": 1.1
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "floral": 6.4,
        "green_herbaceous": 8.2,
        "citrus_terpenic": 4.5
      }
    }
  },
  {
    "id": "ing_sm_s64",
    "name": "Ají Amarillo",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 1.5,
        "sweet": 4.4,
        "sour": 1.5
      },
      "mouthfeel": {
        "pungency": 10.0
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "fruity_ester": 9.0,
        "caramel_sweet": 3.0,
        "floral": 1.1
      }
    }
  },
  {
    "id": "ing_sm_s65",
    "name": "Annatto (Achiote)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 2.0,
        "umami": 1.5,
        "sweet": 4.8,
        "sour": 1.1
      },
      "mouthfeel": {},
      "aromas": {
        "earthy_mineral": 8.0,
        "caramel_sweet": 4.1,
        "floral": 1.5,
        "fruity_ester": 4.4
      }
    }
  },
  {
    "id": "ing_sm_s66",
    "name": "Epazote",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 6.0
      },
      "mouthfeel": {
        "astringency": 4.6,
        "pungency": 4.1
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "earthy_mineral": 1.9,
        "spicy_phenolic": 3.6
      }
    }
  },
  {
    "id": "ing_sm_s67",
    "name": "Porcini Essiccati",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "umami": 8.6,
        "salty": 2.0,
        "bitter": 2.6
      },
      "mouthfeel": {
        "astringency": 1.7
      },
      "aromas": {
        "umami_funky": 7.0,
        "earthy_mineral": 8.8,
        "spicy_phenolic": 3.3
      }
    }
  },
  {
    "id": "ing_sm_s68",
    "name": "Tartufo Nero (polvere)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "umami": 8.6,
        "salty": 2.0,
        "bitter": 1.5,
        "sweet": 0.8
      },
      "mouthfeel": {},
      "aromas": {
        "umami_funky": 7.0,
        "earthy_mineral": 6.0,
        "floral": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s69",
    "name": "Kombu (alga essiccata)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "umami": 10.0,
        "salty": 10.0,
        "bitter": 1.1
      },
      "mouthfeel": {},
      "aromas": {
        "umami_funky": 7.0,
        "earthy_mineral": 4.4,
        "marine_iodine": 8.5
      }
    }
  },
  {
    "id": "ing_sm_s70",
    "name": "Ras el Hanout",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 4.0,
        "bitter": 1.1
      },
      "mouthfeel": {
        "pungency": 5.6
      },
      "aromas": {
        "floral": 9.6,
        "spicy_phenolic": 4.9,
        "caramel_sweet": 3.0
      }
    }
  },
  {
    "id": "ing_sm_s71",
    "name": "Dukkah",
    "category": "herb_spice",
    "composition": {
      "water": 0.05,
      "protein": 0.2,
      "carbs_sugars": 0.25,
      "fat": 0.45
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 2.0,
        "umami": 5.6,
        "sweet": 1.9,
        "sour": 1.5,
        "salty": 1.1
      },
      "mouthfeel": {},
      "aromas": {
        "earthy_mineral": 8.0,
        "fruity_ester": 6.0,
        "umami_funky": 3.9,
        "roasted_pyrazine": 5.5,
        "caramel_sweet": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s72",
    "name": "Grains of Selim",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 4.2,
        "umami": 2.0
      },
      "mouthfeel": {
        "pungency": 5.6,
        "astringency": 1.7
      },
      "aromas": {
        "spicy_phenolic": 10.0,
        "roasted_pyrazine": 6.5,
        "earthy_mineral": 2.8
      }
    }
  },
  {
    "id": "ing_sm_s73",
    "name": "Wasabi (radice)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 2.6,
        "sour": 1.9
      },
      "mouthfeel": {
        "pungency": 10.0,
        "astringency": 2.3
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "green_herbaceous": 6.4,
        "citrus_terpenic": 4.7,
        "sulfurous": 7.5
      }
    }
  },
  {
    "id": "ing_sm_s74",
    "name": "Shiso (Perilla)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "sweet": 1.1,
        "sour": 1.9
      },
      "mouthfeel": {
        "astringency": 2.8
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "floral": 6.4,
        "citrus_terpenic": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s75",
    "name": "Yuzu (scorza)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sour": 4.6,
        "sweet": 2.5
      },
      "mouthfeel": {
        "astringency": 1.5
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "floral": 6.4,
        "fruity_ester": 4.4
      }
    }
  },
  {
    "id": "ing_sm_s76",
    "name": "Finocchietto Selvatico",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "sweet": 3.4,
        "sour": 1.9
      },
      "mouthfeel": {
        "astringency": 2.8
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "caramel_sweet": 4.1,
        "floral": 1.5,
        "citrus_terpenic": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s77",
    "name": "Nepitella (Mentuccia)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 2.3,
        "sweet": 1.1
      },
      "mouthfeel": {
        "astringency": 2.0,
        "pungency": 4.1
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "floral": 6.4,
        "spicy_phenolic": 3.6
      }
    }
  },
  {
    "id": "ing_sm_s78",
    "name": "Mirto (bacche)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 4.2,
        "sweet": 1.9,
        "sour": 1.5
      },
      "mouthfeel": {
        "astringency": 3.9
      },
      "aromas": {
        "green_herbaceous": 10.0,
        "fruity_ester": 6.0,
        "earthy_mineral": 1.4,
        "citrus_terpenic": 4.5
      }
    }
  },
  {
    "id": "ing_sm_s79",
    "name": "Maggiorana",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "sweet": 3.6
      },
      "mouthfeel": {
        "astringency": 2.0
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "floral": 7.5,
        "caramel_sweet": 3.0
      }
    }
  },
  {
    "id": "ing_sm_s80",
    "name": "Ibisco (fiori essiccati)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sour": 10.0,
        "sweet": 1.9,
        "bitter": 2.8
      },
      "mouthfeel": {
        "astringency": 7.4
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "fruity_ester": 10.0,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s81",
    "name": "Camomilla (fiori)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 4.9,
        "bitter": 2.8
      },
      "mouthfeel": {
        "astringency": 1.9
      },
      "aromas": {
        "floral": 10.0,
        "caramel_sweet": 4.1,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s82",
    "name": "Calendula (petali)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 6.5,
        "umami": 1.1,
        "sweet": 0.8
      },
      "mouthfeel": {
        "astringency": 3.5
      },
      "aromas": {
        "earthy_mineral": 8.5,
        "floral": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s83",
    "name": "Assenzio (Wormwood)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 6.1,
        "sweet": 0.8
      },
      "mouthfeel": {
        "astringency": 5.0
      },
      "aromas": {
        "earthy_mineral": 2.5,
        "green_herbaceous": 6.4,
        "floral": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s84",
    "name": "Liquirizia (radice)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 4.5,
        "bitter": 3.9
      },
      "mouthfeel": {
        "astringency": 3.4
      },
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 2.0,
        "green_herbaceous": 6.4,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s85",
    "name": "Genziana (radice)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 7.6,
        "umami": 1.1
      },
      "mouthfeel": {
        "astringency": 5.2
      },
      "aromas": {
        "earthy_mineral": 10.0,
        "spicy_phenolic": 3.3,
        "citrus_terpenic": 4.5,
        "green_herbaceous": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s86",
    "name": "Fava Tonka",
    "category": "herb_spice",
    "composition": {
      "water": 0.05,
      "protein": 0.2,
      "carbs_sugars": 0.25,
      "fat": 0.45
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 5.6,
        "bitter": 1.1
      },
      "mouthfeel": {
        "astringency": 1.7
      },
      "aromas": {
        "caramel_sweet": 9.0,
        "floral": 8.4,
        "spicy_phenolic": 3.3,
        "earthy_mineral": 2.8,
        "roasted_pyrazine": 5.5
      }
    }
  },
  {
    "id": "ing_sm_s87",
    "name": "Anice Verde",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 5.6,
        "bitter": 0.8
      },
      "mouthfeel": {
        "astringency": 1.1
      },
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 8.4,
        "green_herbaceous": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s88",
    "name": "Caperi (boccioli)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "salty": 7.6,
        "umami": 6.1,
        "sour": 2.6
      },
      "mouthfeel": {
        "astringency": 1.1
      },
      "aromas": {
        "citrus_terpenic": 10.0,
        "umami_funky": 3.9,
        "green_herbaceous": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s89",
    "name": "Semi di Senape Nera",
    "category": "herb_spice",
    "composition": {
      "water": 0.05,
      "protein": 0.2,
      "carbs_sugars": 0.25,
      "fat": 0.45
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "mid",
      "taste": {
        "bitter": 5.8,
        "umami": 1.1
      },
      "mouthfeel": {
        "pungency": 10.0,
        "astringency": 1.9
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "earthy_mineral": 7.4,
        "sulfurous": 7.5
      }
    }
  },
  {
    "id": "ing_sm_s90",
    "name": "Cumin Nero (Kala Jeera)",
    "category": "herb_spice",
    "composition": {
      "water": 0.05,
      "protein": 0.2,
      "carbs_sugars": 0.25,
      "fat": 0.45
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 4.2,
        "umami": 2.6
      },
      "mouthfeel": {
        "astringency": 1.5
      },
      "aromas": {
        "earthy_mineral": 8.0,
        "green_herbaceous": 6.4,
        "spicy_phenolic": 4.7,
        "roasted_pyrazine": 3.6
      }
    }
  },
  {
    "id": "ing_sm_s91",
    "name": "Amchoor (Mango Verde)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sour": 5.0,
        "sweet": 1.9,
        "bitter": 2.8
      },
      "mouthfeel": {
        "astringency": 3.4
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "fruity_ester": 6.0,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s92",
    "name": "Loomi (Lime Nero Essiccato)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sour": 3.5,
        "bitter": 4.9,
        "umami": 0.8
      },
      "mouthfeel": {
        "astringency": 4.1
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "earthy_mineral": 6.3
      }
    }
  },
  {
    "id": "ing_sm_s93",
    "name": "Mahlab",
    "category": "herb_spice",
    "composition": {
      "water": 0.05,
      "protein": 0.2,
      "carbs_sugars": 0.25,
      "fat": 0.45
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 5.0,
        "sweet": 2.7,
        "sour": 1.5
      },
      "mouthfeel": {
        "astringency": 3.5
      },
      "aromas": {
        "earthy_mineral": 2.5,
        "fruity_ester": 6.0,
        "floral": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s94",
    "name": "Mastice di Chio",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 4.8,
        "sweet": 1.1
      },
      "mouthfeel": {
        "astringency": 4.9
      },
      "aromas": {
        "spicy_phenolic": 6.0,
        "earthy_mineral": 6.4,
        "floral": 6.4,
        "citrus_terpenic": 4.5,
        "green_herbaceous": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s95",
    "name": "Anardana (Melograno Secco)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sour": 10.0,
        "sweet": 1.9,
        "bitter": 2.8
      },
      "mouthfeel": {
        "astringency": 7.4
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "fruity_ester": 10.0,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s96",
    "name": "Pandan (Pandano)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 4.9,
        "bitter": 0.8
      },
      "mouthfeel": {
        "astringency": 1.1
      },
      "aromas": {
        "floral": 10.0,
        "caramel_sweet": 4.1,
        "green_herbaceous": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s97",
    "name": "Foglie di Curry",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "sour": 3.7,
        "sweet": 1.4
      },
      "mouthfeel": {
        "astringency": 3.1
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "citrus_terpenic": 6.4,
        "fruity_ester": 4.4,
        "roasted_pyrazine": 5.5,
        "caramel_sweet": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s98",
    "name": "Kaffir Lime (Foglie)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "sour": 3.5,
        "sweet": 1.1,
        "bitter": 0.8
      },
      "mouthfeel": {
        "astringency": 2.6
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "floral": 6.4,
        "green_herbaceous": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s99",
    "name": "Shichimi Togarashi",
    "category": "herb_spice",
    "composition": {
      "water": 0.05,
      "protein": 0.2,
      "carbs_sugars": 0.25,
      "fat": 0.45
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "sour": 2.6,
        "umami": 10.0,
        "salty": 5.6
      },
      "mouthfeel": {
        "pungency": 10.0,
        "astringency": 1.1
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "citrus_terpenic": 6.4,
        "umami_funky": 3.9,
        "fruity_ester": 3.0,
        "marine_iodine": 8.5,
        "roasted_pyrazine": 5.5,
        "caramel_sweet": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s100",
    "name": "Pepe Cubeba",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 3.0,
        "sweet": 0.8
      },
      "mouthfeel": {
        "pungency": 7.5,
        "astringency": 2.2
      },
      "aromas": {
        "spicy_phenolic": 10.0,
        "earthy_mineral": 3.8,
        "floral": 4.7,
        "citrus_terpenic": 4.5,
        "green_herbaceous": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s101",
    "name": "Nori (alga tostata)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "umami": 10.0,
        "salty": 10.0,
        "bitter": 1.1
      },
      "mouthfeel": {},
      "aromas": {
        "umami_funky": 7.0,
        "spicy_phenolic": 4.7,
        "roasted_pyrazine": 9.1,
        "marine_iodine": 8.5,
        "caramel_sweet": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s102",
    "name": "Wakame (alga)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "umami": 10.0,
        "salty": 10.0,
        "sweet": 2.5
      },
      "mouthfeel": {},
      "aromas": {
        "umami_funky": 7.0,
        "caramel_sweet": 3.0,
        "floral": 1.1,
        "marine_iodine": 8.5
      }
    }
  },
  {
    "id": "ing_sm_s103",
    "name": "Shiitake Essiccato",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "umami": 8.6,
        "salty": 2.0,
        "bitter": 2.6
      },
      "mouthfeel": {
        "astringency": 1.7
      },
      "aromas": {
        "umami_funky": 7.0,
        "earthy_mineral": 8.8,
        "spicy_phenolic": 3.3
      }
    }
  },
  {
    "id": "ing_sm_s104",
    "name": "Chipotle (Jalapeño Affumicato)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 3.1,
        "umami": 2.0,
        "sweet": 1.4,
        "sour": 1.1
      },
      "mouthfeel": {
        "pungency": 8.6
      },
      "aromas": {
        "spicy_phenolic": 10.0,
        "roasted_pyrazine": 6.5,
        "fruity_ester": 7.4
      }
    }
  },
  {
    "id": "ing_sm_s105",
    "name": "Peperoncino Ancho",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "sweet": 6.4,
        "sour": 1.5,
        "bitter": 1.1,
        "umami": 1.1
      },
      "mouthfeel": {
        "pungency": 3.0
      },
      "aromas": {
        "caramel_sweet": 9.0,
        "floral": 2.0,
        "fruity_ester": 9.0,
        "spicy_phenolic": 4.7,
        "roasted_pyrazine": 9.1
      }
    }
  },
  {
    "id": "ing_sm_s106",
    "name": "Peperoncino Guajillo",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "mid",
      "taste": {
        "sweet": 2.5,
        "sour": 2.0,
        "bitter": 3.9
      },
      "mouthfeel": {
        "pungency": 8.6,
        "astringency": 1.9
      },
      "aromas": {
        "fruity_ester": 10.0,
        "spicy_phenolic": 4.9,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s107",
    "name": "Levistico",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "salty": 6.0,
        "umami": 5.6
      },
      "mouthfeel": {
        "astringency": 2.0
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "umami_funky": 3.9
      }
    }
  },
  {
    "id": "ing_sm_s108",
    "name": "Issopo",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 5.2,
        "sweet": 0.8
      },
      "mouthfeel": {
        "astringency": 4.6
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "earthy_mineral": 1.9,
        "floral": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s109",
    "name": "Erba Luigia",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sour": 3.5,
        "sweet": 3.6
      },
      "mouthfeel": {
        "astringency": 1.5
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "floral": 7.5,
        "caramel_sweet": 3.0
      }
    }
  },
  {
    "id": "ing_sm_s110",
    "name": "Melissa",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "sour": 3.5,
        "sweet": 1.1,
        "bitter": 0.8
      },
      "mouthfeel": {
        "astringency": 2.6
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "floral": 6.4,
        "green_herbaceous": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s111",
    "name": "Borragine",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "sour": 2.6,
        "sweet": 0.8
      },
      "mouthfeel": {
        "astringency": 3.1
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "citrus_terpenic": 6.4,
        "floral": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s112",
    "name": "Pepe di Tasmania",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 2.3,
        "sweet": 1.9,
        "sour": 1.5
      },
      "mouthfeel": {
        "pungency": 7.5,
        "astringency": 1.1
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "fruity_ester": 6.0,
        "green_herbaceous": 8.2,
        "citrus_terpenic": 4.5
      }
    }
  },
  {
    "id": "ing_sm_s113",
    "name": "Galangal Minore (Kencur)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 3.0,
        "sour": 1.9
      },
      "mouthfeel": {
        "pungency": 7.5,
        "astringency": 3.0
      },
      "aromas": {
        "spicy_phenolic": 10.0,
        "earthy_mineral": 3.8,
        "citrus_terpenic": 9.2,
        "green_herbaceous": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s114",
    "name": "Zedoaria (Curcuma Bianca)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 5.0,
        "sour": 2.6,
        "sweet": 0.8
      },
      "mouthfeel": {
        "astringency": 4.6
      },
      "aromas": {
        "earthy_mineral": 2.5,
        "citrus_terpenic": 6.4,
        "floral": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s115",
    "name": "Kala Namak (Sale Nero Indiano)",
    "category": "umami_condiment",
    "composition": {
      "water": 0.01,
      "protein": 0.0,
      "carbs_sugars": 0.0,
      "fat": 0.0
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "salty": 10.0,
        "umami": 8.4,
        "bitter": 1.1
      },
      "mouthfeel": {
        "crunchiness": 6.5
      },
      "aromas": {
        "umami_funky": 5.2,
        "earthy_mineral": 10.0,
        "sulfurous": 8.5
      }
    }
  },
  {
    "id": "ing_sm_s116",
    "name": "Sale di Maldon",
    "category": "umami_condiment",
    "composition": {
      "water": 0.01,
      "protein": 0.0,
      "carbs_sugars": 0.0,
      "fat": 0.0
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "salty": 10.0,
        "umami": 2.0,
        "sweet": 1.1
      },
      "mouthfeel": {
        "crunchiness": 6.5
      },
      "aromas": {
        "floral": 6.4,
        "earthy_mineral": 4.0,
        "marine_iodine": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s117",
    "name": "Fiori di Sambuco",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 4.9,
        "sour": 1.9
      },
      "mouthfeel": {
        "astringency": 0.8
      },
      "aromas": {
        "floral": 10.0,
        "caramel_sweet": 4.1,
        "citrus_terpenic": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s118",
    "name": "Violetta (fiori)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 4.9,
        "bitter": 2.8
      },
      "mouthfeel": {
        "astringency": 1.9
      },
      "aromas": {
        "floral": 10.0,
        "caramel_sweet": 4.1,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s119",
    "name": "Tamarindo",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sour": 10.0,
        "sweet": 4.8
      },
      "mouthfeel": {
        "astringency": 5.5
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "caramel_sweet": 4.1,
        "floral": 1.5,
        "fruity_ester": 8.4
      }
    }
  },
  {
    "id": "ing_sm_s120",
    "name": "Maca Peruviana",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "finish",
      "taste": {
        "sweet": 5.9,
        "bitter": 1.5,
        "umami": 1.1,
        "sour": 1.1
      },
      "mouthfeel": {},
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 2.0,
        "earthy_mineral": 6.0,
        "fruity_ester": 4.4
      }
    }
  },
  {
    "id": "ing_sm_s122",
    "name": "Cerfoglio",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "sweet": 3.6
      },
      "mouthfeel": {
        "astringency": 2.0
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "floral": 7.5,
        "caramel_sweet": 3.0
      }
    }
  },
  {
    "id": "ing_sm_s123",
    "name": "Rafano/Cren",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 5.3
      },
      "mouthfeel": {
        "pungency": 10.0,
        "astringency": 3.4
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "green_herbaceous": 6.4,
        "earthy_mineral": 1.4,
        "sulfurous": 7.5
      }
    }
  },
  {
    "id": "ing_sm_s124",
    "name": "Peperoncino Habanero",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "sweet": 1.9,
        "sour": 3.4
      },
      "mouthfeel": {
        "pungency": 10.0,
        "astringency": 0.8
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "fruity_ester": 9.0,
        "citrus_terpenic": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s125",
    "name": "Piment d'Espelette",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 1.5,
        "sweet": 4.4,
        "sour": 1.5
      },
      "mouthfeel": {
        "pungency": 10.0
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "fruity_ester": 9.0,
        "caramel_sweet": 3.0,
        "floral": 1.1
      }
    }
  },
  {
    "id": "ing_sm_s126",
    "name": "Peperoncino di Cayenna",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 4.1,
        "umami": 2.3
      },
      "mouthfeel": {
        "pungency": 10.0
      },
      "aromas": {
        "spicy_phenolic": 10.0,
        "roasted_pyrazine": 4.9,
        "earthy_mineral": 4.4,
        "fruity_ester": 3.0
      }
    }
  },
  {
    "id": "ing_sm_s127",
    "name": "Paprika Dolce Ungherese",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "finish",
      "taste": {
        "sweet": 6.4,
        "sour": 1.5,
        "bitter": 1.1,
        "umami": 0.8
      },
      "mouthfeel": {},
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 2.0,
        "fruity_ester": 6.0,
        "earthy_mineral": 4.4
      }
    }
  },
  {
    "id": "ing_sm_s128",
    "name": "Carvi (Kümmel)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 3.0,
        "umami": 1.1,
        "sweet": 2.5
      },
      "mouthfeel": {
        "astringency": 2.0
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "earthy_mineral": 6.0,
        "caramel_sweet": 3.0,
        "floral": 1.1
      }
    }
  },
  {
    "id": "ing_sm_s129",
    "name": "Semi di Sesamo",
    "category": "herb_spice",
    "composition": {
      "water": 0.05,
      "protein": 0.2,
      "carbs_sugars": 0.25,
      "fat": 0.45
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "umami": 8.3,
        "salty": 2.0,
        "sweet": 1.9,
        "sour": 1.5,
        "bitter": 1.1
      },
      "mouthfeel": {},
      "aromas": {
        "umami_funky": 7.0,
        "fruity_ester": 6.0,
        "earthy_mineral": 4.4,
        "roasted_pyrazine": 5.5,
        "caramel_sweet": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s130",
    "name": "Semi di Papavero",
    "category": "herb_spice",
    "composition": {
      "water": 0.05,
      "protein": 0.2,
      "carbs_sugars": 0.25,
      "fat": 0.45
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "finish",
      "taste": {
        "sweet": 5.9,
        "bitter": 1.5,
        "umami": 1.1,
        "sour": 1.1
      },
      "mouthfeel": {},
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 2.0,
        "earthy_mineral": 6.0,
        "fruity_ester": 4.4
      }
    }
  },
  {
    "id": "ing_sm_s131",
    "name": "Aglio Nero Fermentato",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "umami": 7.5,
        "salty": 2.0,
        "sweet": 4.8,
        "sour": 7.6
      },
      "mouthfeel": {
        "astringency": 4.0,
        "pungency": 4.5
      },
      "aromas": {
        "umami_funky": 7.0,
        "caramel_sweet": 4.1,
        "floral": 1.5,
        "fruity_ester": 8.4,
        "sulfurous": 7.5
      }
    }
  },
  {
    "id": "ing_sm_s132",
    "name": "Garam Masala",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "sweet": 4.2
      },
      "mouthfeel": {
        "pungency": 7.5
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "caramel_sweet": 4.1,
        "floral": 6.2
      }
    }
  },
  {
    "id": "ing_sm_s133",
    "name": "Fave di Cacao",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "mid",
      "taste": {
        "bitter": 6.5,
        "umami": 1.1,
        "sweet": 1.4,
        "sour": 1.1
      },
      "mouthfeel": {
        "astringency": 3.5
      },
      "aromas": {
        "earthy_mineral": 8.5,
        "fruity_ester": 4.4,
        "roasted_pyrazine": 5.5,
        "caramel_sweet": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s134",
    "name": "Miso in Polvere",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "umami": 9.0,
        "salty": 6.9,
        "bitter": 2.8
      },
      "mouthfeel": {
        "astringency": 1.9
      },
      "aromas": {
        "umami_funky": 7.0,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s135",
    "name": "Pepe di Sansho",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "sour": 2.6,
        "sweet": 0.8
      },
      "mouthfeel": {
        "pungency": 7.5,
        "astringency": 1.1
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "citrus_terpenic": 6.4,
        "floral": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s136",
    "name": "Myoga (Zenzero Giapponese)",
    "category": "herb_spice",
    "composition": {
      "water": 0.1,
      "protein": 0.1,
      "carbs_sugars": 0.62,
      "fat": 0.05
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 1.5,
        "bitter": 1.1,
        "sour": 1.9
      },
      "mouthfeel": {
        "pungency": 5.6,
        "astringency": 0.8
      },
      "aromas": {
        "floral": 8.5,
        "spicy_phenolic": 4.9,
        "citrus_terpenic": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s137",
    "name": "Methi (Foglie di Fieno Greco)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 7.2,
        "umami": 0.8
      },
      "mouthfeel": {
        "astringency": 5.0
      },
      "aromas": {
        "earthy_mineral": 6.9,
        "green_herbaceous": 6.4
      }
    }
  },
  {
    "id": "ing_sm_s138",
    "name": "Kokum",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sour": 10.0,
        "sweet": 1.9,
        "bitter": 2.8
      },
      "mouthfeel": {
        "astringency": 7.4
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "fruity_ester": 10.0,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s139",
    "name": "Sale Nero di Hawaii",
    "category": "umami_condiment",
    "composition": {
      "water": 0.01,
      "protein": 0.0,
      "carbs_sugars": 0.0,
      "fat": 0.0
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "salty": 10.0,
        "umami": 4.3,
        "bitter": 2.6
      },
      "mouthfeel": {
        "crunchiness": 6.5
      },
      "aromas": {
        "spicy_phenolic": 10.0,
        "roasted_pyrazine": 9.4,
        "earthy_mineral": 4.4
      }
    }
  },
  {
    "id": "ing_sm_s140",
    "name": "Panch Phoron",
    "category": "herb_spice",
    "composition": {
      "water": 0.05,
      "protein": 0.2,
      "carbs_sugars": 0.25,
      "fat": 0.45
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 5.8,
        "umami": 1.1
      },
      "mouthfeel": {
        "astringency": 3.9,
        "pungency": 4.5
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "earthy_mineral": 7.4,
        "sulfurous": 7.5
      }
    }
  },
  {
    "id": "ing_sm_s141",
    "name": "Salicornia",
    "category": "herb_spice",
    "composition": {
      "water": 0.1,
      "protein": 0.1,
      "carbs_sugars": 0.62,
      "fat": 0.05
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "salty": 10.0,
        "umami": 10.0,
        "bitter": 1.1
      },
      "mouthfeel": {
        "astringency": 1.5
      },
      "aromas": {
        "green_herbaceous": 6.4,
        "umami_funky": 3.9,
        "marine_iodine": 8.5
      }
    }
  },
  {
    "id": "ing_sm_s142",
    "name": "Agastache (Anice Issopo)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 5.6,
        "bitter": 0.8
      },
      "mouthfeel": {
        "astringency": 1.1
      },
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 8.4,
        "green_herbaceous": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s143",
    "name": "Erba Stella (Asperula)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 5.6,
        "bitter": 0.8
      },
      "mouthfeel": {
        "astringency": 1.1
      },
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 8.4,
        "green_herbaceous": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s144",
    "name": "Semi di Senape Gialla",
    "category": "herb_spice",
    "composition": {
      "water": 0.05,
      "protein": 0.2,
      "carbs_sugars": 0.25,
      "fat": 0.45
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "mid",
      "taste": {
        "bitter": 6.3,
        "umami": 0.8
      },
      "mouthfeel": {
        "pungency": 10.0,
        "astringency": 2.6
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "earthy_mineral": 6.3,
        "sulfurous": 7.5
      }
    }
  },
  {
    "id": "ing_sm_s145",
    "name": "Salvia Bianca del Deserto",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 5.8
      },
      "mouthfeel": {
        "astringency": 6.1
      },
      "aromas": {
        "green_herbaceous": 10.0,
        "spicy_phenolic": 4.5,
        "earthy_mineral": 5.2,
        "citrus_terpenic": 4.5
      }
    }
  },
  {
    "id": "ing_sm_s146",
    "name": "Peperoncino Tabasco",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "sweet": 1.9,
        "sour": 3.4
      },
      "mouthfeel": {
        "pungency": 10.0,
        "astringency": 0.8
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "fruity_ester": 9.0,
        "citrus_terpenic": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s147",
    "name": "Charoli (Chironji)",
    "category": "herb_spice",
    "composition": {
      "water": 0.05,
      "protein": 0.2,
      "carbs_sugars": 0.25,
      "fat": 0.45
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "finish",
      "taste": {
        "sweet": 6.4,
        "sour": 1.5,
        "bitter": 1.1,
        "umami": 0.8
      },
      "mouthfeel": {},
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 2.0,
        "fruity_ester": 6.0,
        "earthy_mineral": 4.4,
        "citrus_terpenic": 4.5,
        "green_herbaceous": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s148",
    "name": "Zereshk (Barberry)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sour": 5.0,
        "sweet": 1.9,
        "bitter": 2.8
      },
      "mouthfeel": {
        "astringency": 3.4
      },
      "aromas": {
        "citrus_terpenic": 10.0,
        "fruity_ester": 6.0,
        "earthy_mineral": 1.4,
        "green_herbaceous": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s149",
    "name": "Neem (foglie)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 7.2,
        "umami": 0.8
      },
      "mouthfeel": {
        "astringency": 5.0
      },
      "aromas": {
        "earthy_mineral": 6.9,
        "green_herbaceous": 6.4
      }
    }
  },
  {
    "id": "ing_sm_s150",
    "name": "Zucchero di Palma Aren",
    "category": "umami_condiment",
    "composition": {
      "water": 0.02,
      "protein": 0.0,
      "carbs_sugars": 0.96,
      "fat": 0.0
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "finish",
      "taste": {
        "sweet": 10.0,
        "sour": 1.5,
        "bitter": 1.1,
        "umami": 0.8
      },
      "mouthfeel": {
        "richness": 3.5
      },
      "aromas": {
        "caramel_sweet": 10.0,
        "floral": 2.0,
        "fruity_ester": 6.0,
        "earthy_mineral": 4.4,
        "roasted_pyrazine": 5.5
      }
    }
  },
  {
    "id": "ing_sm_s151",
    "name": "Ruta",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 7.2
      },
      "mouthfeel": {
        "astringency": 6.7
      },
      "aromas": {
        "earthy_mineral": 5.2,
        "green_herbaceous": 6.4,
        "spicy_phenolic": 3.3
      }
    }
  },
  {
    "id": "ing_sm_s152",
    "name": "Tarassaco (Dente di Leone)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 7.2,
        "umami": 0.8
      },
      "mouthfeel": {
        "astringency": 5.0
      },
      "aromas": {
        "earthy_mineral": 6.9,
        "green_herbaceous": 6.4,
        "roasted_pyrazine": 5.5,
        "caramel_sweet": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s153",
    "name": "Ortica",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 2.6,
        "umami": 6.4,
        "salty": 1.5
      },
      "mouthfeel": {
        "astringency": 2.0
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "umami_funky": 5.2,
        "earthy_mineral": 4.4
      }
    }
  },
  {
    "id": "ing_sm_s154",
    "name": "Acetosa (Romice)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "sour": 3.5,
        "bitter": 3.9
      },
      "mouthfeel": {
        "astringency": 4.9
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "green_herbaceous": 6.4,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s155",
    "name": "Achillea (Millefoglio)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 6.1,
        "sweet": 0.8
      },
      "mouthfeel": {
        "astringency": 5.0
      },
      "aromas": {
        "earthy_mineral": 2.5,
        "green_herbaceous": 6.4,
        "floral": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s156",
    "name": "Malva",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "sweet": 4.2
      },
      "mouthfeel": {
        "astringency": 2.0
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "caramel_sweet": 4.1,
        "floral": 6.2
      }
    }
  },
  {
    "id": "ing_sm_s157",
    "name": "Elicriso (Pianta del Curry)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 4.9,
        "bitter": 0.8
      },
      "mouthfeel": {
        "astringency": 1.1
      },
      "aromas": {
        "floral": 10.0,
        "caramel_sweet": 4.1,
        "green_herbaceous": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s158",
    "name": "Stevia",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 5.3,
        "bitter": 1.1
      },
      "mouthfeel": {
        "astringency": 1.5
      },
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 6.7,
        "green_herbaceous": 6.4
      }
    }
  },
  {
    "id": "ing_sm_s159",
    "name": "Salvastrella (Pimpinella)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 1.5,
        "sour": 3.7,
        "sweet": 1.4
      },
      "mouthfeel": {
        "astringency": 3.1
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "citrus_terpenic": 6.4,
        "fruity_ester": 4.4
      }
    }
  },
  {
    "id": "ing_sm_s160",
    "name": "Erba di Santa Maria (Balsamita)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 5.3,
        "bitter": 1.1
      },
      "mouthfeel": {
        "astringency": 1.5
      },
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 6.7,
        "green_herbaceous": 6.4
      }
    }
  },
  {
    "id": "ing_sm_s161",
    "name": "Monarda (Bergamotto Selvatico)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 1.5,
        "sour": 2.6,
        "bitter": 0.8
      },
      "mouthfeel": {
        "astringency": 2.2
      },
      "aromas": {
        "floral": 8.5,
        "citrus_terpenic": 6.4,
        "green_herbaceous": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s162",
    "name": "Nasturzio (Cappuccina)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 2.6,
        "sweet": 1.4,
        "sour": 1.1
      },
      "mouthfeel": {
        "pungency": 10.0,
        "astringency": 1.5
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "green_herbaceous": 6.4,
        "fruity_ester": 4.4,
        "sulfurous": 7.5
      }
    }
  },
  {
    "id": "ing_sm_s163",
    "name": "Aglio Ursino",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 2.3,
        "umami": 5.6,
        "salty": 1.5
      },
      "mouthfeel": {
        "astringency": 2.0,
        "pungency": 8.6
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "umami_funky": 5.2,
        "spicy_phenolic": 3.6,
        "sulfurous": 7.5
      }
    }
  },
  {
    "id": "ing_sm_s164",
    "name": "Santolina",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 5.8
      },
      "mouthfeel": {
        "astringency": 6.4
      },
      "aromas": {
        "spicy_phenolic": 6.0,
        "earthy_mineral": 6.4,
        "green_herbaceous": 6.4
      }
    }
  },
  {
    "id": "ing_sm_s165",
    "name": "Artemisia Romana",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 5.8,
        "sweet": 1.1
      },
      "mouthfeel": {
        "astringency": 4.6
      },
      "aromas": {
        "earthy_mineral": 2.5,
        "floral": 6.4,
        "green_herbaceous": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s166",
    "name": "Tiglio (Fiori)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 4.9,
        "bitter": 0.8
      },
      "mouthfeel": {
        "astringency": 1.1
      },
      "aromas": {
        "floral": 10.0,
        "caramel_sweet": 4.1,
        "green_herbaceous": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s167",
    "name": "Verbena Officinalis",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 5.2,
        "sweet": 0.8
      },
      "mouthfeel": {
        "astringency": 4.6
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "earthy_mineral": 1.9,
        "floral": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s168",
    "name": "Foglie di Vite",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 4.2,
        "sour": 2.6
      },
      "mouthfeel": {
        "astringency": 5.0
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "citrus_terpenic": 6.4,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s169",
    "name": "Gobo (Bardana)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 4.8,
        "umami": 1.5,
        "sweet": 3.4
      },
      "mouthfeel": {
        "astringency": 1.9,
        "pungency": 4.5
      },
      "aromas": {
        "earthy_mineral": 9.4,
        "caramel_sweet": 4.1,
        "floral": 1.5,
        "sulfurous": 7.5
      }
    }
  },
  {
    "id": "ing_sm_s170",
    "name": "Silene / Stridoli",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 2.6,
        "sweet": 3.4,
        "umami": 0.8
      },
      "mouthfeel": {
        "astringency": 2.0
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "caramel_sweet": 4.1,
        "floral": 1.5,
        "earthy_mineral": 4.4
      }
    }
  },
  {
    "id": "ing_sm_s171",
    "name": "Trifoglio Rosso",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 5.6,
        "bitter": 0.8
      },
      "mouthfeel": {
        "astringency": 1.1
      },
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 8.4,
        "green_herbaceous": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s172",
    "name": "Bacche di Sambuco",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 2.5,
        "sour": 3.9,
        "bitter": 3.8
      },
      "mouthfeel": {
        "astringency": 3.4
      },
      "aromas": {
        "fruity_ester": 8.0,
        "earthy_mineral": 1.9,
        "citrus_terpenic": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s173",
    "name": "Valeriana",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 6.3,
        "umami": 0.8
      },
      "mouthfeel": {
        "astringency": 4.6
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "earthy_mineral": 6.3
      }
    }
  },
  {
    "id": "ing_sm_s174",
    "name": "Geranio Odorato",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 4.0,
        "sour": 2.6
      },
      "mouthfeel": {
        "astringency": 1.1
      },
      "aromas": {
        "floral": 9.6,
        "citrus_terpenic": 6.4,
        "caramel_sweet": 3.0
      }
    }
  },
  {
    "id": "ing_sm_s175",
    "name": "Verga d'Oro (Solidago)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 1.5,
        "bitter": 4.6
      },
      "mouthfeel": {
        "astringency": 3.7
      },
      "aromas": {
        "floral": 8.5,
        "earthy_mineral": 1.9,
        "green_herbaceous": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s176",
    "name": "Rucola",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 5.3
      },
      "mouthfeel": {
        "pungency": 7.5,
        "astringency": 3.4
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "green_herbaceous": 6.4,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s177",
    "name": "Crescione",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 2.6,
        "sour": 1.9
      },
      "mouthfeel": {
        "pungency": 10.0,
        "astringency": 2.3
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "green_herbaceous": 6.4,
        "citrus_terpenic": 4.7,
        "sulfurous": 7.5
      }
    }
  },
  {
    "id": "ing_sm_s178",
    "name": "Rabarbaro",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sour": 4.6,
        "bitter": 3.8,
        "sweet": 1.4
      },
      "mouthfeel": {
        "astringency": 4.1
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "earthy_mineral": 1.9,
        "fruity_ester": 4.4
      }
    }
  },
  {
    "id": "ing_sm_s179",
    "name": "Cicoria",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 7.2,
        "umami": 0.8
      },
      "mouthfeel": {
        "astringency": 5.0,
        "pungency": 7.5
      },
      "aromas": {
        "earthy_mineral": 6.9,
        "green_herbaceous": 6.4,
        "sulfurous": 7.5,
        "fruity_ester": 3.0,
        "roasted_pyrazine": 5.5,
        "caramel_sweet": 3.5
      }
    }
  },
  {
    "id": "ing_sm_s180",
    "name": "Scalogno",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "finish",
      "taste": {
        "bitter": 1.5,
        "sweet": 3.4,
        "umami": 4.1,
        "salty": 1.1
      },
      "mouthfeel": {
        "pungency": 10.0
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "caramel_sweet": 4.1,
        "floral": 1.5,
        "umami_funky": 3.9,
        "sulfurous": 7.5
      }
    }
  },
  {
    "id": "ing_sm_s181",
    "name": "Tulsi (Basilico Santo)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 5,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 2.6,
        "sweet": 0.8
      },
      "mouthfeel": {
        "pungency": 7.5,
        "astringency": 1.5
      },
      "aromas": {
        "spicy_phenolic": 6.5,
        "green_herbaceous": 6.4,
        "floral": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s182",
    "name": "Rosa Canina (Cinorrodi)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 3.3,
        "sour": 4.6
      },
      "mouthfeel": {
        "astringency": 1.1
      },
      "aromas": {
        "fruity_ester": 8.0,
        "citrus_terpenic": 6.4,
        "floral": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s183",
    "name": "Ribes Nero",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 2.5,
        "sour": 4.6,
        "bitter": 2.8
      },
      "mouthfeel": {
        "astringency": 3.0
      },
      "aromas": {
        "fruity_ester": 8.0,
        "citrus_terpenic": 6.4,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s184",
    "name": "Portulaca",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "sour": 3.5,
        "bitter": 1.1,
        "salty": 3.6,
        "umami": 1.1
      },
      "mouthfeel": {
        "astringency": 3.0
      },
      "aromas": {
        "citrus_terpenic": 8.5,
        "green_herbaceous": 6.4
      }
    }
  },
  {
    "id": "ing_sm_s185",
    "name": "Luppolo",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 6.1,
        "sweet": 0.8
      },
      "mouthfeel": {
        "astringency": 5.0
      },
      "aromas": {
        "earthy_mineral": 2.5,
        "green_herbaceous": 6.4,
        "floral": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s186",
    "name": "Olmaria (Meadowsweet)",
    "category": "herb_spice",
    "composition": {
      "water": 0.05,
      "protein": 0.2,
      "carbs_sugars": 0.25,
      "fat": 0.45
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 5.6,
        "sour": 1.9
      },
      "mouthfeel": {
        "astringency": 0.8
      },
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 8.4,
        "citrus_terpenic": 4.7
      }
    }
  },
  {
    "id": "ing_sm_s187",
    "name": "Fiordaliso",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 4.0,
        "bitter": 3.8
      },
      "mouthfeel": {
        "astringency": 2.6
      },
      "aromas": {
        "floral": 9.6,
        "earthy_mineral": 1.9,
        "caramel_sweet": 3.0
      }
    }
  },
  {
    "id": "ing_sm_s188",
    "name": "Moringa",
    "category": "herb_spice",
    "composition": {
      "water": 0.1,
      "protein": 0.1,
      "carbs_sugars": 0.62,
      "fat": 0.05
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 5.8,
        "umami": 1.1
      },
      "mouthfeel": {
        "astringency": 3.9,
        "pungency": 4.5
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "earthy_mineral": 7.4,
        "sulfurous": 7.5
      }
    }
  },
  {
    "id": "ing_sm_s189",
    "name": "Menta Spigata (Spearmint)",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 5.3,
        "bitter": 1.1
      },
      "mouthfeel": {
        "astringency": 1.5
      },
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 6.7,
        "green_herbaceous": 6.4
      }
    }
  },
  {
    "id": "ing_sm_s190",
    "name": "Schisandra (5 Sapori)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 2.5,
        "sour": 4.6,
        "bitter": 2.8
      },
      "mouthfeel": {
        "astringency": 3.0
      },
      "aromas": {
        "fruity_ester": 8.0,
        "citrus_terpenic": 6.4,
        "earthy_mineral": 1.4
      }
    }
  },
  {
    "id": "ing_sm_s191",
    "name": "Giuggiola (Ziziphus)",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "finish",
      "taste": {
        "sweet": 6.4,
        "sour": 1.5,
        "bitter": 1.1,
        "umami": 0.8
      },
      "mouthfeel": {},
      "aromas": {
        "caramel_sweet": 5.5,
        "floral": 2.0,
        "fruity_ester": 6.0,
        "earthy_mineral": 4.4
      }
    }
  },
  {
    "id": "ing_sm_s192",
    "name": "Centella Asiatica",
    "category": "herb_spice",
    "composition": {
      "water": 0.85,
      "protein": 0.03,
      "carbs_sugars": 0.06,
      "fat": 0.01
    },
    "base_state": {
      "volume": 3,
      "temporal_peak": "attack",
      "taste": {
        "bitter": 6.3,
        "umami": 0.8
      },
      "mouthfeel": {
        "astringency": 4.6
      },
      "aromas": {
        "green_herbaceous": 8.5,
        "earthy_mineral": 6.3
      }
    }
  },
  {
    "id": "ing_sm_s193",
    "name": "Camomilla Romana",
    "category": "herb_spice",
    "composition": {
      "water": 0.09,
      "protein": 0.11,
      "carbs_sugars": 0.56,
      "fat": 0.12
    },
    "base_state": {
      "volume": 4,
      "temporal_peak": "attack",
      "taste": {
        "sweet": 6.3,
        "sour": 1.1
      },
      "mouthfeel": {},
      "aromas": {
        "floral": 10.0,
        "caramel_sweet": 4.1,
        "fruity_ester": 4.4
      }
    }
  }
];
