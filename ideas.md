# Canecas Personalizadas - Design Brainstorm

## Três Abordagens Estilísticas

### 1. Minimalista Moderno
**Probabilidade:** 0.08
Estética limpa e contemporânea com foco em tipografia ousada, espaçamento generoso e cores neutras com um acento vibrante. Prioriza a clareza e a usabilidade.

### 2. Artesanal Criativo
**Probabilidade:** 0.07
Design que celebra a customização com elementos ilustrados, cores quentes, tipografia variada e texturas sutis. Transmite autenticidade e criatividade.

### 3. Premium Elegante
**Probabilidade:** 0.06
Abordagem sofisticada com tipografia serif refinada, paleta de cores luxuosa (tons de ouro, preto, branco), gradientes sutis e efeitos de profundidade. Posiciona o produto como premium.

---

## Abordagem Escolhida: **Artesanal Criativo**

### Design Movement
Inspirado em design contemporâneo artesanal com influências de movimentos craft modernos e design gráfico vintage reinterpretado.

### Core Principles
1. **Autenticidade Criativa**: Cada elemento reflete a natureza personalizada do produto, com detalhes que sugerem customização
2. **Hierarquia Visual Clara**: Tipografia dinâmica e cores estratégicas guiam o usuário naturalmente
3. **Espaçamento Generoso**: Respira e deixa o produto ser o protagonista
4. **Interatividade Deliciosa**: Transições suaves e feedback visual que tornam a experiência prazerosa

### Color Philosophy
**Paleta Principal:**
- **Primária**: Terracota quente (`#D97757`) - transmite criatividade, calor e artesanato
- **Secundária**: Azul profundo (`#2C3E50`) - confiança e sofisticação
- **Acento**: Dourado suave (`#D4AF37`) - luxo acessível
- **Neutros**: Branco (`#FFFFFF`), Cinza claro (`#F5F5F5`), Cinza escuro (`#4A4A4A`)

**Raciocínio**: A terracota evoca artesanato e criatividade, enquanto o azul profundo adiciona confiança. O dourado sutil eleva a percepção de qualidade.

### Layout Paradigm
- **Hero Section**: Assimétrico com imagem de caneca em destaque à direita, texto criativo à esquerda
- **Grid de Produtos**: Responsivo (1 coluna mobile, 2 tablets, 3 desktop) com cards que ganham profundidade ao hover
- **Seções**: Alternância entre fundo claro e cinza para criar ritmo visual
- **Admin**: Layout de tabela limpa com ações inline

### Signature Elements
1. **Cantos Suavizados com Sombra**: Todos os cards têm `border-radius: 12px` e sombra delicada
2. **Ícones Customizados**: Pequenos ícones de paleta, caneta e estrela para reforçar criatividade
3. **Divisores Ondulados**: Separações entre seções com ondas sutis

### Interaction Philosophy
- **Hover em Cards**: Elevação suave (sombra maior), escala leve (1.02x) e mudança de cor de fundo
- **Modal de Opções**: Entrada suave com fade + slide, fundo com blur backdrop
- **Botões**: Feedback tátil com `scale(0.97)` ao clicar, transição de cor em 150ms
- **Admin**: Edição inline com validação em tempo real

### Animation
- **Entrada de Cards**: Fade in + slide up com 300ms ease-out, stagger de 50ms entre itens
- **Modal**: Fade backdrop 200ms, modal entra com scale(0.95) → scale(1) em 250ms
- **Hover**: Transições de 150ms com ease-out para suavidade
- **Botões**: Scale 100ms ao clicar, feedback imediato
- **Respecto `prefers-reduced-motion`**: Todas as animações desabilitadas se preferência ativa

### Typography System
- **Display (Títulos)**: `Poppins Bold` (700) para h1, `Poppins SemiBold` (600) para h2
- **Body**: `Inter Regular` (400) para texto corrido, `Inter Medium` (500) para destaque
- **Hierarquia**: 
  - H1: 36px mobile / 48px desktop
  - H2: 24px mobile / 32px desktop
  - Body: 14px mobile / 16px desktop
  - Small: 12px

### Brand Essence
**Positioning**: Canecas personalizadas que transformam momentos comuns em expressões criativas, para pessoas que valorizam autenticidade e qualidade.

**Personality**: Criativo, Confiável, Acessível

### Brand Voice
- **Headlines**: Celebram a criatividade e personalização ("Sua Caneca, Sua Identidade")
- **CTAs**: Diretos e inspiradores ("Personalize Agora", "Crie Sua Caneca")
- **Microcopy**: Conversacional e amigável, sem jargão técnico

**Exemplos:**
- "Cada caneca conta uma história. Qual é a sua?"
- "Transforme uma caneca comum em algo extraordinário"

### Wordmark & Logo
Logo: Ícone de caneca estilizada com um pincel/paleta integrado, cores terracota e azul. Sem texto, apenas o símbolo gráfico.

### Signature Brand Color
**Terracota Quente** (`#D97757`) - cor que aparece em botões primários, ícones principais e elementos de destaque.

---

## Implementação
- Usar Poppins + Inter do Google Fonts
- Tailwind CSS com cores customizadas em `index.css`
- Componentes shadcn/ui para consistência
- Animações com Framer Motion para efeitos sofisticados
- JSON local para dados de produtos (admin pode editar)
