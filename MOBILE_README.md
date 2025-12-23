# Interface Mobile KapaLunch

## Vue d'ensemble

L'interface mobile de KapaLunch est entièrement responsive et optimisée pour les écrans de smartphones (< 768px).

## Caractéristiques principales

### Header Mobile Compact (60px)
- Logo KapaLunch à gauche (cliquable pour retour à la vue globale)
- Boutons d'action à droite :
  - 🔍 Recherche (ouvre modal plein écran)
  - 🔽 Filtres (ouvre modal plein écran avec badge si actifs)
  - 👤 Utilisateur (ouvre panneau latéral)

### Carte Interactive (50% de l'écran)
- Vue carte/satellite switchable
- Markers cliquables
- **Marker sélectionné** : icone violette agrandie avec animation pulse
- Pan/Zoom tactiles
- Recentrage automatique lors de la sélection

### Bottom Sheet (50% de l'écran)

#### 3 états possibles :

**1. Fermé (par défaut)**
- Carte plein écran
- Poignée visible en bas avec nombre de restaurants

**2. Semi-ouvert (50/50)**
- Déclenché par :
  - Clic sur un restaurant dans la liste
  - Clic sur un marker de la carte
  - Swipe up depuis l'état fermé
- Affiche :
  - Nom du restaurant
  - Note moyenne + nombre d'avis
  - Adresse complète
  - Type de cuisine
  - "Glissez vers le haut pour détails"

**3. Plein écran (90% de l'écran)**
- Déclenché par swipe up depuis semi-ouvert
- Affiche :
  - Header avec infos du restaurant
  - Carte mini avec bouton "Voir sur la carte"
  - Liste déroulée des avis
  - Bouton pour laisser un avis (si connecté)

#### Gestures supportés :
- **Swipe up** : Passe à l'état suivant
- **Swipe down** : Passe à l'état précédent
- **Tap sur poignée** : Toggle entre états
- **Tap sur [X]** : Ferme complètement
- **Scroll** : Dans le contenu quand plein écran

### Liste des Restaurants (mode liste compacte)

Quand aucun restaurant n'est sélectionné, le bottom sheet affiche la liste :

```
┌─────────────────────────┐
│ Le Petit Bistrot            │
│ ⭐ 4.5 • 🍽️ Français • 📍 Lyon │
├─────────────────────────┤
│ Sushi Master                │
│ ⭐ 4.8 • 🍽️ Japonais • 📍 Paris│
└─────────────────────────┘
```

- Une ligne pour le nom (gras)
- Une ligne pour note + type + ville
- Séparateur léger
- Tap : Sélectionne + recentre carte + ouvre semi

### Modal Recherche Mobile

Ouverture via bouton 🔍 dans le header :

- Animation slide depuis le haut
- Input avec focus automatique
- Résultats en temps réel
- Liste compacte des résultats
- Tap sur résultat : ferme modal + sélectionne restaurant

### Modal Filtres Mobile

Ouverture via bouton 🔽 dans le header :

- Animation slide depuis le bas
- Filtres disponibles :
  - Type de cuisine (dropdown)
  - Ville (dropdown)
  - Note minimum (boutons chips)
  - Tri par note (radio buttons)
- Footer avec :
  - Bouton "Réinitialiser"
  - Bouton "Appliquer (X)" avec nombre de filtres actifs
- Badge rouge sur icône si filtres actifs

### Formulaire Ajout Restaurant

Mode plein écran avec :
- Header sticky avec gradient violet
- Champs optimisés pour mobile (min 48px)
- Validation en temps réel
- Bouton submit sticky en bas

## Animations

### Marker sélectionné
```css
animation: markerPulse 1.5s ease-in-out infinite;
- Scale : 1.25 → 1.35 → 1.25
- Opacity : 1 → 0.7 → 1
- Drop shadow violet
```

### Bottom Sheet
```css
transition: transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
- Smooth slide avec easing naturel
- Bounce léger à l'arrivée
- Poignée change de couleur au drag
```

### Recentrage carte
```javascript
map.flyTo(targetLatLng, zoom, {
  duration: 300ms,
  easeLinearity: 0.25
});
```

## Breakpoints

```css
/* Mobile */
@media (max-width: 768px) { /* Mode mobile complet */ }

/* Tablette */
@media (min-width: 769px) and (max-width: 1024px) { /* Mode desktop */ }

/* Desktop */
@media (min-width: 1025px) { /* Mode desktop */ }
```

## Flow utilisateur typique

1. **Ouverture de l'app**
   - Vue carte globale avec tous les markers
   - Bottom sheet fermé

2. **Recherche d'un restaurant**
   - Tap sur 🔍
   - Tape "bistrot"
   - Sélectionne "Le Petit Bistrot"

3. **Carte recentre**
   - Animation fluide (300ms)
   - Marker devient violet + pulse
   - Bottom sheet monte à 50%

4. **Consultation rapide**
   - Voir note, adresse, type
   - Décision : "Glisser vers le haut"

5. **Voir détails**
   - Swipe up
   - Bottom sheet à 90%
   - Scroll des avis
   - Bouton "Laisser un avis"

6. **Retour à la carte**
   - Tap sur "Voir sur la carte" OU
   - Swipe down × 2

## Fichiers concernés

- `frontend/src/styles/mobile.css` - Tous les styles mobile
- `frontend/src/components/BottomSheet.jsx` - Composant bottom sheet avec gestures
- `frontend/src/components/MobileModals.jsx` - Modals recherche et filtres
- `frontend/src/components/Map.jsx` - Fonction centerOnRestaurant pour mobile
- `frontend/src/App.jsx` - Détection mobile + rendu conditionnel

## Optimisations mobiles

- Touch targets min 44px
- Pas d'effets hover (only :active)
- Animations GPU-accelerated (transform/opacity)
- Pas de scroll imbriqués
- Clavier optimisé selon les champs
- Gestures intuitifs
- Feedback visuel immédiat

## Dépendances

Aucune librairie supplémentaire nécessaire :
- Touch events natifs
- CSS transitions
- Leaflet pour la carte (déjà présent)
