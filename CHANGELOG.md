# Changelog - KapaLunch

## [Dernières modifications] - 2025-12-20

### Améliorations UX

#### 1. Remplacement des notifications intrusives

**Problème** : Lorsqu'un restaurant existait déjà dans la base, l'application utilisait `window.confirm()` qui:
- Bloquait complètement l'interface
- N'offrait qu'un choix OK/Annuler
- Était peu esthétique et non personnalisable

**Solution** : Système de Toast notifications modernes
- Notifications non-bloquantes qui s'affichent en haut de l'écran
- 4 types de notifications : `info`, `success`, `warning`, `error`
- Auto-fermeture configurable (5 secondes par défaut)
- Possibilité d'ajouter un bouton d'action
- Design moderne avec animations fluides
- Responsive (adaptation mobile)

**Fichiers créés** :
- `frontend/src/components/Toast.jsx` : Composant Toast réutilisable
- `frontend/src/styles/Toast.css` : Styles des toasts avec animations

**Fichiers modifiés** :
- `frontend/src/App.jsx` : Ajout de la gestion des toasts
- `frontend/src/components/AddRestaurantForm.jsx` : Remplacement de `window.confirm()` par Toast

**Utilisation** :
```javascript
// Toast simple
showToast('Message', 'success')

// Toast avec action
showToast(
  'Restaurant déjà existant',
  'warning',
  7000, // durée en ms
  'Voir la fiche', // label du bouton
  () => handleAction() // callback
)
```

#### 2. Navigation logo vers carte globale

**Problème** : Le logo "KapaLunch" dans le header était cliquable mais la fonction de retour à la carte globale n'était pas complète.

**Solution** : Implémentation complète de la navigation
- Clic sur le logo désélectionne le restaurant actuel
- Ferme le panneau de détails
- Zoom out pour afficher tous les restaurants
- Animation fluide avec `flyToBounds()`
- Padding automatique pour une vue optimale

**Fichiers modifiés** :
- `frontend/src/components/Map.jsx` : Amélioration de `resetView()` avec réinitialisation de `prevSelectedRef`
- `frontend/src/App.jsx` : Appel de `mapRef.current.resetView()` lors du clic logo

**Comportement** :
1. L'utilisateur clique sur "KapaLunch" dans le header
2. Le panneau de détails se ferme si ouvert
3. Le restaurant sélectionné est désélectionné
4. La carte effectue un zoom out animé pour afficher tous les restaurants
5. Vue globale avec padding de 50px de chaque côté

### Avantages

**Expérience utilisateur** :
- Interface plus fluide et moderne
- Moins d'interruptions dans le flux de travail
- Navigation intuitive
- Feedback visuel clair

**Technique** :
- Code réutilisable (composant Toast)
- Meilleure séparation des responsabilités
- Utilisation des refs React pour communication parent-enfant
- Animations CSS performantes

### Tests recommandés

1. **Toast notifications** :
   - Essayer d'ajouter un restaurant existant
   - Vérifier que le toast s'affiche correctement
   - Cliquer sur "Voir la fiche" pour ouvrir le restaurant
   - Vérifier la fermeture automatique après 7 secondes
   - Fermer manuellement avec le bouton X

2. **Navigation logo** :
   - Sélectionner un restaurant sur la carte
   - Cliquer sur le logo "KapaLunch"
   - Vérifier que la carte effectue un zoom out animé
   - Vérifier que tous les restaurants sont visibles
   - Vérifier que le panneau de détails se ferme

### Compatibilité

- Chrome/Edge : ✅ Testé
- Firefox : ✅ Testé
- Safari : ✅ Compatible
- Mobile : ✅ Responsive

### Notes techniques

**Toast Component** :
- Utilise `position: fixed` pour rester visible pendant le scroll
- Z-index élevé (10000) pour passer au-dessus de tous les éléments
- Auto-fermeture avec `setTimeout` et cleanup
- Support des animations CSS avec `@keyframes`

**Map resetView** :
- Utilise `useImperativeHandle` pour exposer la méthode au parent
- `flyToBounds()` avec options `padding`, `maxZoom`, `duration`
- Réinitialisation de `prevSelectedRef` pour éviter les bugs de navigation
