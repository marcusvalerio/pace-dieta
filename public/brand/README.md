# Marca Pace

## Símbolo (`marca/`)

- `simbolo-grafite.svg`: uso padrão sobre fundos claros.
- `simbolo-branco.svg`: uso sobre fundos escuros (Noite `#0B0B0C`).

O símbolo é um prato visto de cima com uma folha vazada. A folha fica sempre
inteira dentro do círculo. Tamanho mínimo: 16 px na tela.

## Ícones de alimentos (`icones/alimentos/`)

32 ícones em grade de 24 px, em três estilos com o mesmo desenho:

| Pasta | Estilo | Uso sugerido |
|---|---|---|
| `paleta/` | **Paleta Pace (estilo principal)** | Plano, refeições, conquistas, telas do app |
| `reais/` | Cores reais de cada alimento | Lista de compras |
| `duotone/` | Cinza `#9CA3AB` + detalhe `#0B1B2B` | Telas densas, estados desativados |

`icones.json` lista o nome de arquivo e o nome em português de cada ícone.

### Cores da paleta por grupo

| Grupo | Corpo | Detalhe |
|---|---|---|
| Frutas e verduras | `#C2E297` Lima | `#4A6B1F` |
| Proteínas e laticínios | `#D3C5D3` Lilás | `#5E4566` |
| Carboidratos | `#C5D5EC` Céu | `#3B5784` |
| Gorduras boas | `#FFE3E2` Rosa | `#A0453F` |
| Café | `#EADFCC` Areia | `#6B4423` |

### Uso no código

```jsx
<img src="/brand/icones/alimentos/paleta/maca.svg" alt="Maçã" width={32} height={32} />
```
