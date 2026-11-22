import { RecipeSample } from '../engine/recipeParser';
import { PresetRecipe } from '../types/flavor';

/**
 * Le 30 Ricette Storiche della Tradizione Italiana
 * Mappate sia per il Simulatore Computazionale (PresetRecipe)
 * sia per l'Analizzatore Testuale con grammature e procedimento (RecipeSample).
 */
export const ITALIAN_HISTORICAL_PRESETS: PresetRecipe[] = [
  {
    id: 'hist_01_carbonara',
    name: '1. Spaghetti alla Carbonara (Lazio)',
    subtitle: 'Emulsione Lipidi-Tuorlo • Maillard & Piperina',
    description:
      'Classico romano: emulsione termocontrollata (62–65°C) di tuorlo d’uovo, Pecorino Romano DOP e grasso fuso del guanciale rosolato, chiusa dal pepe nero tostato.',
    items: [
      { ingredientId: 'ing_pasta_semolina', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_pork_guanciale', techniqueId: 'tech_maillard_sear', dosage: 'secondary' },
      { ingredientId: 'ing_egg_yolk', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_pecorino', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_black_pepper', techniqueId: 'tech_dry_toast_spices', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_02_amatriciana',
    name: "2. Bucatini all'Amatriciana (Lazio)",
    subtitle: 'Grasso di Guanciale • Glutammato del San Marzano & Pecorino',
    description:
      'Ricetta storica di Amatrice: il grasso nobile del guanciale rosolato e sfumato al vino bianco incontra l’acidità e il glutammato del pomodoro San Marzano e la sapidità del Pecorino.',
    items: [
      { ingredientId: 'ing_pasta_semolina', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_tomato_sanmarzano', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_pork_guanciale', techniqueId: 'tech_maillard_sear', dosage: 'secondary' },
      { ingredientId: 'ing_pecorino', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_white_wine_dry', techniqueId: 'tech_wine_reduction', dosage: 'garnish' },
      { ingredientId: 'ing_chili_peperoncino', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_03_cacio_pepe',
    name: '3. Tonnarelli Cacio e Pepe (Lazio)',
    subtitle: 'Emulsione Amido-Caseina • Terpeni & Piperina Tostata',
    description:
      'Triade minimale romana: l’amido della pasta stabilizza le proteine del Pecorino Romano impedendone la flocculazione, mentre il pepe tostato a secco sprigiona cariofillene e piperina.',
    items: [
      { ingredientId: 'ing_pasta_semolina', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_pecorino', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_black_pepper', techniqueId: 'tech_dry_toast_spices', dosage: 'secondary' },
    ],
  },
  {
    id: 'hist_04_gricia',
    name: '4. Rigatoni alla Gricia (Lazio)',
    subtitle: 'Antenata Bianca dell’Amatriciana • Lipidi, Umami & Pungenza',
    description:
      'La più antica delle paste pastorali laziali (precedente all’introduzione del pomodoro): guanciale croccante, emulsione di acqua amidacea e Pecorino Romano, pepe nero in grani.',
    items: [
      { ingredientId: 'ing_pasta_semolina', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_pork_guanciale', techniqueId: 'tech_maillard_sear', dosage: 'main' },
      { ingredientId: 'ing_pecorino', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_black_pepper', techniqueId: 'tech_dry_toast_spices', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_05_ragu_bolognese',
    name: '5. Tagliatelle al Ragù alla Bolognese (Emilia-Romagna)',
    subtitle: 'Maillard Carni • Dolcezza del Soffritto & Morbidezza Lattica',
    description:
      'Codificato a Bologna: lunga stufatura di manzo e pancetta su base aromatica di cipolla, carota e sedano, sfumata al vino, con triplo concentrato e latte intero a smorzare l’acidità.',
    items: [
      { ingredientId: 'ing_pasta_semolina', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_beef_chuck', techniqueId: 'tech_maillard_sear', dosage: 'main' },
      { ingredientId: 'ing_pork_belly', techniqueId: 'tech_maillard_sear', dosage: 'secondary' },
      { ingredientId: 'ing_onion_yellow', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_carrot', techniqueId: 'tech_caramelize_braise', dosage: 'garnish' },
      { ingredientId: 'ing_celery', techniqueId: 'tech_caramelize_braise', dosage: 'garnish' },
      { ingredientId: 'ing_tomato_paste', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_whole_milk', techniqueId: 'tech_caramelize_braise', dosage: 'garnish' },
      { ingredientId: 'ing_red_wine_dry', techniqueId: 'tech_wine_reduction', dosage: 'garnish' },
      { ingredientId: 'ing_parmigiano', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_06_risotto_milanese',
    name: '6. Risotto alla Milanese (Lombardia)',
    subtitle: 'Safranale & Crocina • Mantecatura Acqua-Lipidi',
    description:
      'Riso Carnaroli tostato con cipolla stufata nel burro, sfumato al vino bianco, colorato e profumato dallo zafferano in pistilli e mantecato all’onda con burro freddo e Parmigiano.',
    items: [
      { ingredientId: 'ing_rice_carnaroli', techniqueId: 'tech_risottatura', dosage: 'main' },
      { ingredientId: 'ing_butter', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_parmigiano', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_onion_yellow', techniqueId: 'tech_caramelize_braise', dosage: 'garnish' },
      { ingredientId: 'ing_saffron', techniqueId: 'tech_steam_poach', dosage: 'secondary' },
      { ingredientId: 'ing_white_wine_dry', techniqueId: 'tech_wine_reduction', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_07_ossobuco_gremolada',
    name: '7. Ossobuco alla Milanese in Gremolada (Lombardia)',
    subtitle: 'Collagene Brasato • Taglio Terpenico a Crudo',
    description:
      'Stufatura lenta del vitello che trasforma il collagene in gelatina setosa, ravvivata a fine cottura dalla gremolada a crudo (scorza di limone, aglio e prezzemolo).',
    items: [
      { ingredientId: 'ing_veal', techniqueId: 'tech_floured_meat_sear', dosage: 'main' },
      { ingredientId: 'ing_butter', techniqueId: 'tech_maillard_sear', dosage: 'secondary' },
      { ingredientId: 'ing_onion_yellow', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_white_wine_dry', techniqueId: 'tech_wine_reduction', dosage: 'garnish' },
      { ingredientId: 'ing_lemon', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_parsley', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_garlic', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_08_cotoletta_milanese',
    name: '8. Cotoletta alla Milanese (Lombardia)',
    subtitle: 'Crosta Croccante nel Burro Chiarificato • Succosità Interna',
    description:
      'Costoletta di vitello impanata nell’uovo e pane, dorata nel burro spumeggiante fino a sviluppare pirazine tostate e lattoni burrosi.',
    items: [
      { ingredientId: 'ing_veal', techniqueId: 'tech_maillard_sear', dosage: 'main' },
      { ingredientId: 'ing_sourdough_bread', techniqueId: 'tech_deep_fry', dosage: 'secondary' },
      { ingredientId: 'ing_butter', techniqueId: 'tech_brown_butter_infusion', dosage: 'secondary' },
      { ingredientId: 'ing_whole_egg', techniqueId: 'tech_deep_fry', dosage: 'garnish' },
      { ingredientId: 'ing_sea_salt', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_09_pesto_genovese',
    name: '9. Trenette al Pesto Genovese (Liguria)',
    subtitle: 'Estrazione a Freddo • Linalolo, Pinoli & Doppio Formaggio',
    description:
      'Emulsione a crudo al mortaio: l’olio EVO incapsula gli oli essenziali volatili del Basilico Genovese DOP evitando l’ossidazione termica, sostenuto da pinoli, aglio, Parmigiano e Pecorino.',
    items: [
      { ingredientId: 'ing_pasta_semolina', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_basil', techniqueId: 'tech_raw', dosage: 'main' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_parmigiano', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_pecorino', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_pine_nut', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_garlic', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_sea_salt', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_10_spaghetti_vongole',
    name: '10. Spaghetti alle Vongole Veraci (Campania)',
    subtitle: 'Acqua Iodata & Succinato • Emulsione Amido-Olio EVO',
    description:
      'Grande classico partenopeo: l’acido succinico e i bromofenoli marini delle vongole aperte a vapore si legano in un’emulsione stabile con olio EVO, aglio biondo, vino bianco e prezzemolo.',
    items: [
      { ingredientId: 'ing_pasta_semolina', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_clams', techniqueId: 'tech_steam_poach', dosage: 'main' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_garlic', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
      { ingredientId: 'ing_white_wine_dry', techniqueId: 'tech_wine_reduction', dosage: 'garnish' },
      { ingredientId: 'ing_parsley', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_chili_peperoncino', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_11_spaghetti_nerano',
    name: '11. Spaghetti alla Nerano (Campania)',
    subtitle: 'Dolcezza delle Zucchine Fritte • Mantecatura Fondente',
    description:
      'Nata a Marina del Cantone: le rondelle di zucchina fritte e riposate sprigionano dolcezza caramellata che si fonde in mantecatura con formaggio stagionato, burro e basilico fresco.',
    items: [
      { ingredientId: 'ing_pasta_semolina', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_zucchini', techniqueId: 'tech_deep_fry', dosage: 'main' },
      { ingredientId: 'ing_parmigiano', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_butter', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
      { ingredientId: 'ing_garlic', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
      { ingredientId: 'ing_basil', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_black_pepper', techniqueId: 'tech_dry_toast_spices', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_12_pasta_patate_provola',
    name: '12. Pasta e Patate con Provola Affumicata (Campania)',
    subtitle: 'Doppio Amido Cremoso • Fenoli Affumicati della Provola',
    description:
      'Monumentale piatto popolare napoletano: la doppia gelatinizzazione degli amidi di patata e pasta crea una crema densa arricchita dal soffritto, pancetta e provola affumicata filante.',
    items: [
      { ingredientId: 'ing_pasta_semolina', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_potato', techniqueId: 'tech_caramelize_braise', dosage: 'main' },
      { ingredientId: 'ing_smoked_provola', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_pork_belly', techniqueId: 'tech_maillard_sear', dosage: 'secondary' },
      { ingredientId: 'ing_onion_yellow', techniqueId: 'tech_caramelize_braise', dosage: 'garnish' },
      { ingredientId: 'ing_celery', techniqueId: 'tech_caramelize_braise', dosage: 'garnish' },
      { ingredientId: 'ing_tomato_sanmarzano', techniqueId: 'tech_caramelize_braise', dosage: 'garnish' },
      { ingredientId: 'ing_parmigiano', techniqueId: 'tech_emulsion_mantecatura', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_13_parmigiana_melanzane',
    name: '13. Parmigiana di Melanzane (Campania / Sicilia)',
    subtitle: 'Spugna Lipidica Fritta • Acidità del Pomodoro & Latticini',
    description:
      'Stratificazione di melanzane fritte, salsa di San Marzano, mozzarella di bufala, Parmigiano Reggiano e basilico: equilibrio perfetto tra grassi, umami, dolcezza e freschezza erbacea.',
    items: [
      { ingredientId: 'ing_eggplant', techniqueId: 'tech_deep_fry', dosage: 'main' },
      { ingredientId: 'ing_tomato_sanmarzano', techniqueId: 'tech_caramelize_braise', dosage: 'main' },
      { ingredientId: 'ing_mozzarella_bufala', techniqueId: 'tech_maillard_sear', dosage: 'secondary' },
      { ingredientId: 'ing_parmigiano', techniqueId: 'tech_maillard_sear', dosage: 'secondary' },
      { ingredientId: 'ing_onion_yellow', techniqueId: 'tech_caramelize_braise', dosage: 'garnish' },
      { ingredientId: 'ing_basil', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_14_pasta_alla_norma',
    name: '14. Pasta alla Norma (Sicilia)',
    subtitle: 'Melanzana Fritta • Sapidità Lattica della Ricotta Salata',
    description:
      'Omaggio catanese a Vincenzo Bellini: maccheroni al pomodoro fresco e basilico, melanzane fritte dorate e una generosa grattugiata di ricotta salata stagionata.',
    items: [
      { ingredientId: 'ing_pasta_semolina', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_eggplant', techniqueId: 'tech_deep_fry', dosage: 'main' },
      { ingredientId: 'ing_tomato_sanmarzano', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_ricotta_salata', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_basil', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_garlic', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_15_caponata_siciliana',
    name: '15. Caponata Siciliana in Agrodolce (Sicilia)',
    subtitle: 'Tensione Agrodolce • Contrasto Salinità-Frutta Secca',
    description:
      'Sinfonia barocca siciliana: melanzane fritte, sedano croccante, cipolla, pomodoro, olive, capperi di Pantelleria, uvetta e pinoli legati dalla riduzione agrodolce di aceto e zucchero.',
    items: [
      { ingredientId: 'ing_eggplant', techniqueId: 'tech_deep_fry', dosage: 'main' },
      { ingredientId: 'ing_celery', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_onion_yellow', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_tomato_sanmarzano', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_taggiasca_olives', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_capers', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_raisin', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_pine_nut', techniqueId: 'tech_dry_toast_spices', dosage: 'garnish' },
      { ingredientId: 'ing_apple_vinegar', techniqueId: 'tech_wine_reduction', dosage: 'secondary' },
      { ingredientId: 'ing_brown_sugar', techniqueId: 'tech_wine_reduction', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_16_puttanesca',
    name: '16. Spaghetti alla Puttanesca (Campania / Lazio)',
    subtitle: 'Bomba Umami Mediterranea • Inosinato d’Acciuga & Capperi',
    description:
      'Sinergia esplosiva tra il glutammato del pomodoro e delle olive e l’inosinato delle acciughe sciolte nell’olio all’aglio, punteggiata dai capperi e dal peperoncino.',
    items: [
      { ingredientId: 'ing_pasta_semolina', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_tomato_sanmarzano', techniqueId: 'tech_caramelize_braise', dosage: 'main' },
      { ingredientId: 'ing_taggiasca_olives', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_capers', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_anchovy_salted', techniqueId: 'tech_confit_fat', dosage: 'secondary' },
      { ingredientId: 'ing_garlic', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
      { ingredientId: 'ing_chili_peperoncino', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
      { ingredientId: 'ing_parsley', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_confit_fat', dosage: 'secondary' },
    ],
  },
  {
    id: 'hist_17_aglio_olio_peperoncino',
    name: '17. Spaghetti Aglio, Olio e Peperoncino (Campania / Italia)',
    subtitle: 'Infusione Lipidica di Allicina & Capsaicina • Emulsione Amido',
    description:
      'La prova del fuoco dell’emulsione italiana: aglio e peperoncino infusi dolcemente a bassa temperatura nell’olio EVO, montati con acqua di cottura ricca d’amido e prezzemolo fresco.',
    items: [
      { ingredientId: 'ing_pasta_semolina', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_confit_fat', dosage: 'main' },
      { ingredientId: 'ing_garlic', techniqueId: 'tech_confit_fat', dosage: 'secondary' },
      { ingredientId: 'ing_chili_peperoncino', techniqueId: 'tech_confit_fat', dosage: 'secondary' },
      { ingredientId: 'ing_parsley', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_sea_salt', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_18_arrabbiata',
    name: "18. Penne all'Arrabbiata (Lazio)",
    subtitle: 'Trigemino Capsaicinico • Acidità del San Marzano',
    description:
      'Classico romano ad alta pungenza: salsa viva di pomodoro San Marzano, aglio rosolato nell’olio EVO, peperoncino rosso deciso, prezzemolo a crudo e velo di Pecorino Romano.',
    items: [
      { ingredientId: 'ing_pasta_semolina', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_tomato_sanmarzano', techniqueId: 'tech_caramelize_braise', dosage: 'main' },
      { ingredientId: 'ing_chili_peperoncino', techniqueId: 'tech_confit_fat', dosage: 'secondary' },
      { ingredientId: 'ing_garlic', techniqueId: 'tech_confit_fat', dosage: 'secondary' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_confit_fat', dosage: 'secondary' },
      { ingredientId: 'ing_parsley', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_pecorino', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_19_pasta_e_ceci',
    name: '19. Pasta e Ceci alla Romana (Lazio)',
    subtitle: 'Cremosità Leguminosa • Ponte Terpenico Rosmarino-Acciuga',
    description:
      'Parte dei ceci viene frullata per creare un’emulsione vellutata, insaporita dal battuto caldo di olio EVO, aglio, rosmarino fresco e filetti d’acciuga sciolti.',
    items: [
      { ingredientId: 'ing_chickpeas', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_pasta_semolina', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_anchovy_salted', techniqueId: 'tech_confit_fat', dosage: 'secondary' },
      { ingredientId: 'ing_rosemary', techniqueId: 'tech_confit_fat', dosage: 'secondary' },
      { ingredientId: 'ing_garlic', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
      { ingredientId: 'ing_tomato_paste', techniqueId: 'tech_caramelize_braise', dosage: 'garnish' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_black_pepper', techniqueId: 'tech_dry_toast_spices', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_20_ribollita_toscana',
    name: '20. Ribollita Toscana (Toscana)',
    subtitle: 'Amidi di Cannellini & Pane Raffermo • Clorofilla e Timo',
    description:
      'Zuppa contadina toscana: crema di fagioli cannellini, verdure a foglia scura, soffritto aromatico, pane toscano ribollito in tegame e olio EVO nuovo a crudo.',
    items: [
      { ingredientId: 'ing_cannellini_beans', techniqueId: 'tech_caramelize_braise', dosage: 'main' },
      { ingredientId: 'ing_sourdough_bread', techniqueId: 'tech_caramelize_braise', dosage: 'main' },
      { ingredientId: 'ing_spinach', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_onion_yellow', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_carrot', techniqueId: 'tech_caramelize_braise', dosage: 'garnish' },
      { ingredientId: 'ing_celery', techniqueId: 'tech_caramelize_braise', dosage: 'garnish' },
      { ingredientId: 'ing_tomato_sanmarzano', techniqueId: 'tech_caramelize_braise', dosage: 'garnish' },
      { ingredientId: 'ing_thyme', techniqueId: 'tech_caramelize_braise', dosage: 'garnish' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_raw', dosage: 'secondary' },
    ],
  },
  {
    id: 'hist_21_pappa_al_pomodoro',
    name: '21. Pappa al Pomodoro (Toscana)',
    subtitle: 'Pane Raffermo Idratato • Licopene, Aglio & Olio Fruttato',
    description:
      'Capolavoro povero toscano: il pane assorbe il pomodoro maturo stufato con aglio, trasformandosi in una crema densa esaltata da basilico spezzato e olio extravergine a crudo.',
    items: [
      { ingredientId: 'ing_tomato_sanmarzano', techniqueId: 'tech_caramelize_braise', dosage: 'main' },
      { ingredientId: 'ing_sourdough_bread', techniqueId: 'tech_caramelize_braise', dosage: 'main' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_garlic', techniqueId: 'tech_confit_fat', dosage: 'secondary' },
      { ingredientId: 'ing_basil', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_black_pepper', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_22_bistecca_fiorentina',
    name: '22. Bistecca alla Fiorentina sulla Brace (Toscana)',
    subtitle: 'Pirazine da Carbone Vivo • Cuore Succoso & Olio Nuovo',
    description:
      'Cottura violenta su brace viva per formare una crosta ricca di pirazine e composti fenolici del fumo, mantenendo il cuore al sangue, condita con sale in fiocchi, pepe e olio EVO.',
    items: [
      { ingredientId: 'ing_beef_chuck', techniqueId: 'tech_charcoal_grill', dosage: 'main' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_sea_salt', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_black_pepper', techniqueId: 'tech_dry_toast_spices', dosage: 'garnish' },
      { ingredientId: 'ing_rosemary', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_23_peposo_impruneta',
    name: "23. Peposo dell'Impruneta (Toscana)",
    subtitle: 'Brasatura Lenta nel Chianti • Aglio & Pepe in Grani',
    description:
      'Antica ricetta dei fornacini del Brunelleschi: muscolo di manzo cotto per ore nel vino rosso strutturato con abbondante aglio e pepe nero fino a diventare tenerissimo.',
    items: [
      { ingredientId: 'ing_beef_chuck', techniqueId: 'tech_caramelize_braise', dosage: 'main' },
      { ingredientId: 'ing_red_wine_dry', techniqueId: 'tech_wine_reduction', dosage: 'main' },
      { ingredientId: 'ing_black_pepper', techniqueId: 'tech_dry_toast_spices', dosage: 'secondary' },
      { ingredientId: 'ing_garlic', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_tomato_paste', techniqueId: 'tech_caramelize_braise', dosage: 'garnish' },
      { ingredientId: 'ing_sea_salt', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_24_saltimbocca_romana',
    name: '24. Saltimbocca alla Romana (Lazio)',
    subtitle: 'Vitello, Prosciutto Crudo & Tujone della Salvia',
    description:
      'Citato da Pellegrino Artusi: fettine di vitello con Prosciutto di Parma e foglia di salvia fresca, rosolate nel burro e deglassate al vino bianco secco.',
    items: [
      { ingredientId: 'ing_veal', techniqueId: 'tech_maillard_sear', dosage: 'main' },
      { ingredientId: 'ing_prosciutto_crudo', techniqueId: 'tech_maillard_sear', dosage: 'secondary' },
      { ingredientId: 'ing_sage', techniqueId: 'tech_brown_butter_infusion', dosage: 'secondary' },
      { ingredientId: 'ing_butter', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_white_wine_dry', techniqueId: 'tech_wine_reduction', dosage: 'secondary' },
      { ingredientId: 'ing_black_pepper', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_25_pollo_cacciatora',
    name: '25. Pollo alla Cacciatora (Toscana / Centro Italia)',
    subtitle: 'Rosolatura Pelle • Deglassatura Vino Rosso, Pomodoro & Erbe',
    description:
      'Pollo ruspante rosolato con la pelle fino a doratura intensa, sfumato con vino rosso e cotto con soffritto, pomodoro, olive taggiasche, aglio e rosmarino.',
    items: [
      { ingredientId: 'ing_chicken_thigh', techniqueId: 'tech_maillard_sear', dosage: 'main' },
      { ingredientId: 'ing_tomato_sanmarzano', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_red_wine_dry', techniqueId: 'tech_wine_reduction', dosage: 'secondary' },
      { ingredientId: 'ing_onion_yellow', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_taggiasca_olives', techniqueId: 'tech_caramelize_braise', dosage: 'garnish' },
      { ingredientId: 'ing_rosemary', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
      { ingredientId: 'ing_garlic', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_26_fegato_veneziana',
    name: '26. Fegato alla Veneziana con Polenta (Veneto)',
    subtitle: 'Ferro Minerale del Fegato • Dolcezza della Cipolla Stufata',
    description:
      'Ricetta storica lagunare: la dolcezza solforosa delle cipolle stufate a lungo e la spinta acida dell’aceto bilanciano la nota ferrosa e minerale del fegato di vitello, servito con polenta.',
    items: [
      { ingredientId: 'ing_calf_liver', techniqueId: 'tech_maillard_sear', dosage: 'main' },
      { ingredientId: 'ing_onion_yellow', techniqueId: 'tech_caramelize_braise', dosage: 'main' },
      { ingredientId: 'ing_polenta_corn', techniqueId: 'tech_steam_poach', dosage: 'secondary' },
      { ingredientId: 'ing_butter', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
      { ingredientId: 'ing_apple_vinegar', techniqueId: 'tech_wine_reduction', dosage: 'garnish' },
      { ingredientId: 'ing_parsley', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_27_baccala_vicentina',
    name: '27. Baccalà alla Vicentina con Polenta (Veneto)',
    subtitle: 'Pipare Lento nel Latte & Olio • Umami Marino-Caseario',
    description:
      'Stufatura lentissima ("pipare") di merluzzo/baccalà con cipolle, acciughe, latte intero, Parmigiano e abbondante olio EVO fino a creare un’emulsione cremosa servita su polenta.',
    items: [
      { ingredientId: 'ing_cod_baccala', techniqueId: 'tech_caramelize_braise', dosage: 'main' },
      { ingredientId: 'ing_whole_milk', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_onion_yellow', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_anchovy_salted', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
      { ingredientId: 'ing_parmigiano', techniqueId: 'tech_caramelize_braise', dosage: 'garnish' },
      { ingredientId: 'ing_polenta_corn', techniqueId: 'tech_steam_poach', dosage: 'secondary' },
      { ingredientId: 'ing_parsley', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_28_sarde_in_saor',
    name: '28. Pesce Azzurro in Saor Veneziano (Veneto)',
    subtitle: 'Marinatura Agrodolce di Cipolle • Pinoli & Uvetta',
    description:
      'Tecnica storica dei marinai veneziani: pesce azzurro fritto e maturato con cipolle stufate nell’aceto, addolcite da uvetta sultanina e pinoli tostati.',
    items: [
      { ingredientId: 'ing_mackerel', techniqueId: 'tech_deep_fry', dosage: 'main' },
      { ingredientId: 'ing_onion_yellow', techniqueId: 'tech_caramelize_braise', dosage: 'main' },
      { ingredientId: 'ing_apple_vinegar', techniqueId: 'tech_acid_marinade', dosage: 'secondary' },
      { ingredientId: 'ing_raisin', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_pine_nut', techniqueId: 'tech_dry_toast_spices', dosage: 'garnish' },
      { ingredientId: 'ing_bay_leaf', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_29_vitello_tonnato',
    name: '29. Vitello Tonnato Tradizionale (Piemonte)',
    subtitle: 'Sinergia Carne-Mare • Emulsione Tonno, Acciughe & Capperi',
    description:
      'Girello di vitello cotto delicatamente a bassa temperatura, nappato con un’emulsione vellutata di tonno, acciughe, capperi, tuorlo d’uovo, olio EVO e limone.',
    items: [
      { ingredientId: 'ing_veal', techniqueId: 'tech_sous_vide', dosage: 'main' },
      { ingredientId: 'ing_bluefin_tuna', techniqueId: 'tech_steam_poach', dosage: 'secondary' },
      { ingredientId: 'ing_egg_yolk', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_anchovy_salted', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_capers', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_lemon', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'hist_30_tiramisu',
    name: '30. Tiramisù Tradizionale (Veneto / Friuli)',
    subtitle: 'Cremosità Lipidica del Mascarpone • Amaro Tostato Caffè-Cacao',
    description:
      'Il dolce italiano più celebre al mondo: la ricchezza lattica e dolce della crema di mascarpone e tuorlo d’uovo è bilanciata dalle pirazine amare del caffè espresso e del cacao.',
    items: [
      { ingredientId: 'ing_mascarpone', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_egg_yolk', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_coffee_espresso', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_dark_chocolate_85', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_brown_sugar', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_sourdough_bread', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
];

export const ITALIAN_HISTORICAL_SAMPLES: RecipeSample[] = [
  {
    id: 'sample_hist_01',
    label: '1. Carbonara',
    title: 'Spaghetti alla Carbonara (Tradizione Romana)',
    text: `Ingredienti (per 4 persone):
- 320 g di spaghetti di semola di grano duro
- 160 g di guanciale stagionato
- 5 tuorli d'uovo
- 90 g di Pecorino Romano DOP grattugiato
- Pepe nero Tellicherry in grani q.b.

Procedimento:
Taglia il guanciale a listarelle spesse e fallo rosolare a secco in padella partendo da freddo fino a renderlo croccante fuori e fondente dentro.
Tosta in padella i grani di pepe nero pestati al mortaio.
Sbatti i tuorli con il Pecorino Romano e un cucchiaio di grasso tiepido del guanciale fino a formare una pasta densa.
Scola gli spaghetti al dente e manteca fuori dal fuoco con la carbocrema e poca acqua di cottura amidacea.`,
  },
  {
    id: 'sample_hist_02',
    label: '2. Amatriciana',
    title: "Bucatini all'Amatriciana (Tradizione di Amatrice)",
    text: `Ingredienti (per 4 persone):
- 320 g di bucatini di semola
- 150 g di guanciale stagionato
- 400 g di pomodoro San Marzano maturo pelato
- 80 g di Pecorino Romano DOP
- 50 ml di vino bianco secco
- 1 peperoncino rosso fresco
- Sale marino q.b.

Procedimento:
Rosola il guanciale a listarelle con il peperoncino fino a doratura, sfuma con il vino bianco secco e metti da parte le listarelle croccanti.
Nel fondo di cottura stufa i pomodori San Marzano schiacciati a mano per 15 minuti.
Scola i bucatini al dente, unisci il guanciale e manteca con abbondante Pecorino grattugiato.`,
  },
  {
    id: 'sample_hist_03',
    label: '3. Cacio e Pepe',
    title: 'Tonnarelli Cacio e Pepe (Tradizione Romana)',
    text: `Ingredienti (per 4 persone):
- 320 g di tonnarelli o spaghetti di semola
- 180 g di Pecorino Romano DOP grattugiato finissimo
- 8 g di pepe nero in grani

Procedimento:
Pesta il pepe nero in grani e tostalo a secco in una padella ampia finché sprigiona i suoi aromi, poi sfumalo con un mestolo di acqua amidacea della pasta.
Stempera il Pecorino Romano con acqua tiepida (55-60°C) fino a ottenere una crema liscia.
Scola la pasta al dente nella padella col pepe e manteca fuori dal fuoco con la crema di Pecorino.`,
  },
  {
    id: 'sample_hist_04',
    label: '4. Gricia',
    title: 'Rigatoni alla Gricia (Tradizione Laziale)',
    text: `Ingredienti (per 4 persone):
- 320 g di rigatoni o mezze maniche di semola
- 180 g di guanciale stagionato
- 100 g di Pecorino Romano DOP
- Pepe nero in grani q.b.

Procedimento:
Rosola lentamente il guanciale tagliato a listarelle fino a renderlo dorato e croccante.
Tosta il pepe nero macinato grosso nel grasso del guanciale e aggiungi un mestolo di acqua di cottura della pasta per creare un'emulsione.
Scola i rigatoni molto al dente, risottali nel fondo e manteca a fuoco spento con il Pecorino Romano.`,
  },
  {
    id: 'sample_hist_05',
    label: '5. Ragù Bolognese',
    title: 'Tagliatelle al Ragù alla Bolognese (Ricetta Storica)',
    text: `Ingredienti (per 4 persone):
- 350 g di pasta (tagliatelle)
- 300 g di manzo (cartella o taglio reale macinato grosso)
- 150 g di pancetta fresca di maiale
- 60 g di cipolla dorata
- 60 g di carota
- 60 g di sedano verde
- 100 g di triplo concentrato di pomodoro
- 100 ml di vino rosso secco
- 150 ml di latte intero fresco
- 60 g di Parmigiano Reggiano 24 mesi
- Sale marino e pepe nero q.b.

Procedimento:
Rosola la pancetta tritata, aggiungi il battuto di cipolla, carota e sedano e stufa dolcemente.
Unisci il manzo e rosolalo a fuoco vivo per attivare la reazione di Maillard, poi sfuma con il vino rosso.
Aggiungi il concentrato di pomodoro e cuoci a fuoco lentissimo per 3 ore aggiungendo il latte intero verso fine cottura. Condisci le tagliatelle con Parmigiano.`,
  },
  {
    id: 'sample_hist_06',
    label: '6. Risotto alla Milanese',
    title: 'Risotto alla Milanese con Zafferano in Pistilli',
    text: `Ingredienti (per 4 persone):
- 320 g di riso Carnaroli
- 80 g di burro vaccino
- 70 g di Parmigiano Reggiano 24 mesi
- 1/2 cipolla dorata
- 1 g di zafferano in pistilli
- 80 ml di vino bianco secco
- Sale marino q.b.

Procedimento:
Metti in infusione i pistilli di zafferano in acqua calda.
Stufa la cipolla tritata finissima in 30 g di burro senza farla bruciare.
Tosta il riso Carnaroli, sfuma con il vino bianco e porta a cottura risottando per 16 minuti e unendo l'infuso di zafferano.
Fuori dal fuoco manteca energicamente all'onda con il burro freddo restante e il Parmigiano Reggiano.`,
  },
  {
    id: 'sample_hist_07',
    label: '7. Ossobuco in Gremolada',
    title: 'Ossobuco alla Milanese in Gremolada',
    text: `Ingredienti (per 4 persone):
- 4 ossibuchi di vitello
- 50 g di burro vaccino
- 1 cipolla dorata
- 100 ml di vino bianco secco
- Scorza grattugiata di 1 limone non trattato
- 1 mazzetto di prezzemolo fresco
- 1 spicchio d'aglio
- Sale marino e pepe nero q.b.

Procedimento:
Infarina leggermente gli ossibuchi di vitello scuotendo la farina in eccesso, poi rosolali nel burro spumeggiante con la cipolla fino a formare una bella doratura su entrambi i lati.
Sfuma con il vino bianco secco e prosegui la brasatura lenta a fuoco dolce con coperchio per circa 90 minuti.
A fine cottura aggiungi a crudo la gremolada: trito finissimo di prezzemolo, aglio e scorza di limone.`,
  },
  {
    id: 'sample_hist_08',
    label: '8. Cotoletta alla Milanese',
    title: 'Cotoletta alla Milanese (Costoletta di Vitello nel Burro)',
    text: `Ingredienti (per 4 persone):
- 4 costolette di vitello con l'osso
- 2 uova intere
- 150 g di mollica di pane grattugiata
- 120 g di burro vaccino chiarificato
- Sale marino in fiocchi q.b.

Procedimento:
Passa le costolette di vitello nell'uovo sbattuto e poi nel pangrattato premendo bene per far aderire la panatura.
Friggi dolcemente nel burro spumeggiante nocciola irrorando continuamente la superficie con il burro caldo.
Asciuga e servi con fiocchi di sale marino.`,
  },
  {
    id: 'sample_hist_09',
    label: '9. Pesto Genovese',
    title: 'Trenette al Pesto Genovese Tradizionale al Mortaio',
    text: `Ingredienti (per 4 persone):
- 320 g di trenette o linguine di semola
- 60 g di foglie di Basilico Genovese fresco
- 80 ml di olio extravergine d'oliva
- 45 g di Parmigiano Reggiano 24 mesi
- 25 g di Pecorino DOP
- 20 g di pinoli mediterranei
- 1 spicchio d'aglio
- Sale marino grosso q.b.

Procedimento:
Pesta a crudo nel mortaio l'aglio con i grani di sale grosso e i pinoli fino a ottenere una crema.
Aggiungi le foglie di basilico con movimento rotatorio per estrarre gli oli essenziali senza ossidarli.
Incorpora a crudo il Parmigiano, il Pecorino e l'olio extravergine a filo. Condisci la pasta fuori dal fuoco.`,
  },
  {
    id: 'sample_hist_10',
    label: '10. Spaghetti alle Vongole',
    title: 'Spaghetti alle Vongole Veraci (Tradizione Partenopea)',
    text: `Ingredienti (per 4 persone):
- 320 g di spaghetti di semola
- 1 kg di vongole veraci spurgate
- 50 ml di olio extravergine d'oliva
- 2 spicchi d'aglio
- 60 ml di vino bianco secco
- 1 mazzetto di prezzemolo fresco
- 1 peperoncino rosso fresco

Procedimento:
Fai imbiondire dolcemente l'aglio e i gambi di prezzemolo nell'olio extravergine con un pizzico di peperoncino.
Unisci le vongole veraci a fiamma viva, sfuma con il vino bianco e copri per farle aprire a vapore; sguscia parte dei molluschi e filtra il liquido.
Scola gli spaghetti molto al dente e risottali nell'acqua delle vongole con olio EVO a filo e prezzemolo tritato a crudo.`,
  },
  {
    id: 'sample_hist_11',
    label: '11. Spaghetti alla Nerano',
    title: 'Spaghetti alla Nerano (Marina del Cantone)',
    text: `Ingredienti (per 4 persone):
- 320 g di spaghetti di semola
- 600 g di zucchine verdi chiare
- 120 g di Parmigiano Reggiano / Provolone del Monaco grattugiato
- 40 g di burro vaccino
- 1 spicchio d'aglio
- Foglie di basilico fresco
- Olio extravergine d'oliva e pepe nero q.b.

Procedimento:
Taglia le zucchine a rondelle sottili, friggile fino a doratura e lasciale riposare con foglie di basilico.
In padella sciogli una noce di burro con uno spicchio d'aglio e parte delle zucchine fritte.
Scola gli spaghetti al dente e manteca a fuoco spento alternando acqua amidacea e formaggio grattugiato fino a formare una crema vellutata.`,
  },
  {
    id: 'sample_hist_12',
    label: '12. Pasta e Patate con Provola',
    title: 'Pasta e Patate Azzeccata alla Napoletana con Provola Affumicata',
    text: `Ingredienti (per 4 persone):
- 280 g di pasta mista di semola
- 600 g di patate a pasta gialla
- 200 g di provola o scamorza affumicata a cubetti
- 80 g di pancetta di maiale
- 1 cipolla dorata
- 1 costa di sedano
- 2 pomodori San Marzano
- 40 g di Parmigiano Reggiano
- Olio extravergine d'oliva, sale e pepe nero q.b.

Procedimento:
Soffriggi cipolla, sedano e pancetta a dadini nell'olio EVO, poi unisci i pomodori e le patate a cubetti stufandole fino a renderle morbide.
Cuoci la pasta direttamente insieme alle patate perché gli amidi si fondano.
A fuoco spento manteca con la provola affumicata a cubetti e il Parmigiano fino a renderla filante.`,
  },
  {
    id: 'sample_hist_13',
    label: '13. Parmigiana di Melanzane',
    title: 'Parmigiana di Melanzane Classica',
    text: `Ingredienti (per 4 persone):
- 1 kg di melanzane viola
- 800 g di pomodoro San Marzano
- 350 g di mozzarella di bufala ben scolata
- 100 g di Parmigiano Reggiano 24 mesi
- 1/2 cipolla dorata
- 1 mazzetto di basilico fresco
- Olio extravergine d'oliva e sale q.b.

Procedimento:
Affetta le melanzane, spurgale col sale e friggile fino a doratura.
Prepara una salsa stufando la cipolla nell'olio EVO e cuocendo i pomodori San Marzano con basilico fresco.
Alterna in teglia strati di salsa, melanzane fritte, mozzarella, Parmigiano e basilico, poi gratina in forno a 200°C finché la superficie è dorata.`,
  },
  {
    id: 'sample_hist_14',
    label: '14. Pasta alla Norma',
    title: 'Maccheroni alla Norma (Tradizione Catanese)',
    text: `Ingredienti (per 4 persone):
- 320 g di maccheroni o rigatoni di semola
- 2 melanzane viola
- 500 g di pomodoro San Marzano maturo
- 120 g di ricotta salata stagionata
- 2 spicchi d'aglio
- Foglie di basilico fresco
- Olio extravergine d'oliva e sale q.b.

Procedimento:
Taglia le melanzane a fette o tocchetti e friggile in olio caldo fino a doratura intensa.
Prepara una salsa di pomodoro fresco profumata con aglio imbiondito nell'olio EVO e foglie di basilico.
Condisci la pasta con la salsa, adagia le melanzane fritte e completa a crudo con abbondante ricotta salata grattugiata e basilico.`,
  },
  {
    id: 'sample_hist_15',
    label: '15. Caponata Siciliana',
    title: 'Caponata Siciliana Tradizionale in Agrodolce',
    text: `Ingredienti (per 4 persone):
- 800 g di melanzane viola
- 250 g di cuori di sedano verde
- 1 cipolla dorata grande
- 300 g di pomodoro San Marzano
- 100 g di olive in salamoia
- 40 g di capperi di Pantelleria dissalati
- 30 g di pinoli tostati
- 30 g di uvetta sultanina
- 60 ml di aceto
- 30 g di zucchero
- Olio extravergine d'oliva e basilico fresco q.b.

Procedimento:
Taglia le melanzane a cubetti e friggile fino a doratura.
Stufa la cipolla e il sedano a tocchetti con pomodoro, olive, capperi, uvetta e pinoli tostati.
Versa lo zucchero sciolto nell'aceto per creare la riduzione agrodolce, unisci le melanzane fritte e lascia riposare prima di servire con basilico fresco.`,
  },
  {
    id: 'sample_hist_16',
    label: '16. Spaghetti alla Puttanesca',
    title: 'Spaghetti alla Puttanesca',
    text: `Ingredienti (per 4 persone):
- 320 g di spaghetti di semola
- 450 g di pomodoro San Marzano pelato
- 100 g di olive taggiasche o di Gaeta
- 35 g di capperi di Pantelleria dissalati
- 6 filetti di acciughe sotto sale
- 2 spicchi d'aglio
- 1 peperoncino rosso fresco
- 1 mazzetto di prezzemolo fresco
- 40 ml di olio extravergine d'oliva

Procedimento:
Sciogli a bassa temperatura i filetti d'acciuga nell'olio extravergine insieme all'aglio e al peperoncino.
Unisci i capperi, le olive e i pomodori San Marzano schiacciati e lascia sobbollire a fuoco vivo per 12 minuti.
Salta gli spaghetti al dente nel sugo e completa con prezzemolo fresco tritato a crudo.`,
  },
  {
    id: 'sample_hist_17',
    label: '17. Aglio, Olio e Peperoncino',
    title: 'Spaghetti Aglio, Olio e Peperoncino Emulsionati',
    text: `Ingredienti (per 4 persone):
- 320 g di spaghetti di semola
- 70 ml di olio extravergine d'oliva
- 3 spicchi d'aglio fresco
- 2 peperoncini rossi freschi
- 1 mazzetto di prezzemolo fresco
- Sale marino q.b.

Procedimento:
Affetta sottilmente l'aglio e il peperoncino e infondili dolcemente a bassa temperatura nell'olio extravergine senza bruciarli.
Aggiungi un mestolo di acqua bollente amidacea della pasta e agita la padella per creare un'emulsione cremosa.
Scola gli spaghetti molto al dente, risottali nell'emulsione e chiudi a fuoco spento con prezzemolo tritato.`,
  },
  {
    id: 'sample_hist_18',
    label: "18. Penne all'Arrabbiata",
    title: "Penne all'Arrabbiata (Tradizione Romana)",
    text: `Ingredienti (per 4 persone):
- 320 g di penne rigate di semola
- 450 g di pomodoro San Marzano
- 2 peperoncini rossi freschi
- 2 spicchi d'aglio
- 40 g di Pecorino Romano DOP
- 1 mazzetto di prezzemolo fresco
- 40 ml di olio extravergine d'oliva

Procedimento:
Imbiondisci l'aglio e il peperoncino nell'olio extravergine d'oliva.
Unisci i pomodori San Marzano e cuoci a fiamma vivace per 12-15 minuti.
Salta le penne al dente nella salsa e completa a fuoco spento con prezzemolo tritato e una spolverata di Pecorino Romano.`,
  },
  {
    id: 'sample_hist_19',
    label: '19. Pasta e Ceci Romana',
    title: 'Pasta e Ceci alla Romana con Rosmarino e Acciughe',
    text: `Ingredienti (per 4 persone):
- 400 g di ceci cotti
- 200 g di pasta corta (maltagliati o ditalini)
- 3 filetti di acciughe sotto sale
- 2 rametti di rosmarino fresco
- 2 spicchi d'aglio
- 1 cucchiaio di concentrato di pomodoro
- 50 ml di olio extravergine d'oliva
- Pepe nero in grani q.b.

Procedimento:
Soffriggi dolcemente nell'olio EVO l'aglio, il rosmarino tritato e i filetti d'acciuga fino a scioglierli, poi unisci il concentrato di pomodoro.
Aggiungi i ceci cotti (frullandone un terzo per dare cremosità), allunga con brodo caldo e cuoci la pasta direttamente nella zuppa.
Servi con olio EVO a crudo e pepe nero macinato.`,
  },
  {
    id: 'sample_hist_20',
    label: '20. Ribollita Toscana',
    title: 'Ribollita Toscana Tradizionale',
    text: `Ingredienti (per 4 persone):
- 400 g di fagioli cannellini cotti
- 250 g di pane toscano a lievitazione naturale raffermo
- 300 g di spinaci e verdure a foglia verde scura
- 1 cipolla dorata
- 1 carota
- 1 costa di sedano
- 150 g di pomodoro San Marzano
- 2 rametti di timo fresco
- 60 ml di olio extravergine d'oliva
- Sale e pepe nero q.b.

Procedimento:
Stufa cipolla, carota e sedano con il timo nell'olio EVO, poi unisci il pomodoro, le verdure a foglia e metà dei fagioli cannellini interi più l'altra metà passata in crema.
Stratifica la zuppa con fette di pane raffermo, lascia riposare e ribolli in tegame il giorno successivo, completando con olio extravergine nuovo a crudo.`,
  },
  {
    id: 'sample_hist_21',
    label: '21. Pappa al Pomodoro',
    title: 'Pappa al Pomodoro Toscana',
    text: `Ingredienti (per 4 persone):
- 600 g di pomodoro San Marzano maturo
- 300 g di pane toscano a lievitazione naturale raffermo
- 3 spicchi d'aglio
- 1 mazzetto abbondante di basilico fresco
- 70 ml di olio extravergine d'oliva fruttato
- Sale e pepe nero q.b.

Procedimento:
Fai imbiondire dolcemente l'aglio nell'olio extravergine, aggiungi i pomodori maturi e cuoci per 15 minuti.
Unisci il pane a pezzi, copri con acqua o brodo caldo e mescola con la frusta finché il pane si disfa in una pappa cremosa.
Fuori dal fuoco profuma con molto basilico spezzato a mano e un giro generoso di olio EVO a crudo.`,
  },
  {
    id: 'sample_hist_22',
    label: '22. Bistecca alla Fiorentina',
    title: 'Bistecca alla Fiorentina sulla Brace Viva',
    text: `Ingredienti (per 4 persone):
- 1,2 kg di bistecca di manzo con l'osso (taglio alto)
- 30 ml di olio extravergine d'oliva
- Sale marino integrale in fiocchi q.b.
- Pepe nero in grani q.b.
- 1 rametto di rosmarino fresco

Procedimento:
Porta la carne a temperatura ambiente e cuocila su brace viva ardente 4-5 minuti per lato e 5 minuti in piedi sull'osso per sviluppare una crosta Maillard intensa lasciando il cuore rosso e succoso.
Fai riposare 5 minuti, scaloppa e condisci a crudo con fiocchi di sale marino, pepe nero e un filo d'olio EVO.`,
  },
  {
    id: 'sample_hist_23',
    label: "23. Peposo dell'Impruneta",
    title: "Peposo dell'Impruneta (Stufato al Chianti e Pepe)",
    text: `Ingredienti (per 4 persone):
- 800 g di muscolo di manzo a cubotti
- 500 ml di vino rosso secco strutturato (Chianti)
- 6 spicchi d'aglio in camicia
- 12 g di pepe nero in grani
- 1 cucchiaio di concentrato di pomodoro
- Sale marino q.b.

Procedimento:
Metti in un tegame di coccio il manzo a cubotti, gli spicchi d'aglio, il pepe nero in grani, il concentrato e copri interamente con il vino rosso.
Brasa a fuoco lentissimo coperto per oltre 3 ore finché il collagene si scioglie e il vino si riduce in una glassa densa e lucida.`,
  },
  {
    id: 'sample_hist_24',
    label: '24. Saltimbocca alla Romana',
    title: 'Saltimbocca alla Romana (Ricetta Artusi)',
    text: `Ingredienti (per 4 persone):
- 400 g di fettine sottili di fesa di vitello
- 100 g di Prosciutto Crudo di Parma 24 mesi
- 12 foglie di salvia fresca
- 50 g di burro vaccino
- 80 ml di vino bianco secco
- Pepe nero q.b.

Procedimento:
Fissa su ogni fettina di vitello una fetta di prosciutto crudo e una foglia di salvia con uno stecchino.
Rosola rapidamente a fiamma viva nel burro spumeggiante per 2 minuti per lato.
Togli la carne, deglassa il fondo con il vino bianco secco e una noce di burro freddo creando un'emulsione lucida, poi nappa i saltimbocca.`,
  },
  {
    id: 'sample_hist_25',
    label: '25. Pollo alla Cacciatora',
    title: 'Pollo alla Cacciatora con Olive e Rosmarino',
    text: `Ingredienti (per 4 persone):
- 1 kg di sovracosce di pollo ruspante con pelle
- 400 g di pomodoro San Marzano pelato
- 120 ml di vino rosso secco
- 1 cipolla dorata
- 80 g di olive taggiasche
- 2 spicchi d'aglio
- 2 rametti di rosmarino fresco
- 40 ml di olio extravergine d'oliva
- Sale e pepe nero q.b.

Procedimento:
Rosola a lungo i pezzi di pollo nell'olio EVO con aglio e rosmarino finché la pelle è dorata e croccante.
Aggiungi la cipolla affettata, sfuma con il vino rosso secco e fallo ridurre.
Unisci i pomodori San Marzano e le olive taggiasche e prosegui la cottura a fuoco dolce per 35 minuti.`,
  },
  {
    id: 'sample_hist_26',
    label: '26. Fegato alla Veneziana',
    title: 'Fegato alla Veneziana con Cipolle e Polenta',
    text: `Ingredienti (per 4 persone):
- 500 g di fegato di vitello fresco a listarelle
- 500 g di cipolle stufate
- 40 g di burro vaccino
- 30 ml di olio extravergine d'oliva
- 20 ml di aceto di mele o di vino
- 1 mazzetto di prezzemolo fresco
- 300 g di polenta di mais calda
- Sale e pepe nero q.b.

Procedimento:
Stufa dolcemente le cipolle affettate finissime nel burro e olio EVO per 25 minuti finché diventano morbide e dolci, poi sfuma con l'aceto.
Alza la fiamma, unisci il fegato di vitello e rosolalo per soli 3-4 minuti perché resti morbido e succoso.
Completa con prezzemolo tritato e servi sopra la polenta calda.`,
  },
  {
    id: 'sample_hist_27',
    label: '27. Baccalà alla Vicentina',
    title: 'Baccalà alla Vicentina con Polenta',
    text: `Ingredienti (per 4 persone):
- 600 g di baccalà / stoccafisso ammollato
- 250 g di cipolle dorate
- 4 filetti di acciughe sotto sale
- 400 ml di latte intero fresco
- 150 ml di olio extravergine d'oliva
- 40 g di Parmigiano Reggiano grattugiato
- 1 mazzetto di prezzemolo fresco
- 300 g di polenta di mais

Procedimento:
Stufa le cipolle nell'olio EVO insieme alle acciughe e al prezzemolo tritato.
Disponi i tranci di baccalà in tegame con il soffritto e il Parmigiano, poi copri con il latte intero e l'olio extravergine.
Fai "pipare" (sobbollire dolcemente) per 3-4 ore senza mai mescolare ma muovendo il tegame, e servi con polenta calda.`,
  },
  {
    id: 'sample_hist_28',
    label: '28. Sarde in Saor',
    title: 'Pesce Azzurro in Saor Veneziano',
    text: `Ingredienti (per 4 persone):
- 600 g di filetti di sgombro o sarde fresche
- 600 g di cipolle dorate
- 120 ml di aceto
- 50 g di uvetta sultanina
- 40 g di pinoli tostati
- 2 foglie di alloro
- Olio per friggere e sale marino q.b.

Procedimento:
Friggi i filetti di pesce azzurro fino a doratura e scolali su carta assorbente.
Stufa lentamente le cipolle affettate nell'olio con l'alloro, poi versa l'aceto e fai evaporare per creare il saor agrodolce.
Alterna in una pirofila strati di pesce fritto, cipolle in agrodolce, uvetta ammollata e pinoli tostati e lascia maturare 24 ore.`,
  },
  {
    id: 'sample_hist_29',
    label: '29. Vitello Tonnato',
    title: 'Vitello Tonnato Tradizionale Piemontese',
    text: `Ingredienti (per 4 persone):
- 700 g di girello o scamone di vitello magro
- 180 g di tonno di qualità
- 5 filetti di acciughe sotto sale
- 30 g di capperi di Pantelleria dissalati
- 2 tuorli d'uovo sodi
- 100 ml di olio extravergine d'oliva
- Succo di 1/2 limone

Procedimento:
Cuoci il vitello a bassa temperatura (o poché in brodo aromatico e vino bianco) finché il cuore raggiunge 58-60°C, poi raffreddalo e affettalo sottilissimo.
Emulsiona al mixer il tonno, i tuorli, le acciughe, i capperi, il succo di limone e l'olio extravergine a filo fino a ottenere una salsa vellutata.
Nappa le fette di vitello e guarnisci con fiori di cappero.`,
  },
  {
    id: 'sample_hist_30',
    label: '30. Tiramisù Tradizionale',
    title: 'Tiramisù Tradizionale al Mascarpone e Caffè Espresso',
    text: `Ingredienti (per 4 persone):
- 500 g di mascarpone artigianale
- 5 tuorli d'uovo freschissimi
- 100 g di zucchero
- 250 ml di caffè Arabica espresso non zuccherato
- 40 g di cacao amaro / cioccolato fondente 85%
- 250 g di biscotti savoiardi

Procedimento:
Monta a lungo i tuorli con lo zucchero fino a ottenere una spuma chiara, poi incorpora delicatamente il mascarpone freddo creando un'emulsione cremosa e aerata.
Inzuppa rapidamente i savoiardi nel caffè espresso freddo e alterna due strati di biscotti e crema al mascarpone.
Lascia riposare in frigorifero e completa prima del servizio con cacao amaro e cioccolato fondente grattugiato.`,
  },
];
