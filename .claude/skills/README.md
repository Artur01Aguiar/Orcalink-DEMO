# Skills — UI UX Pro Max

Skills de design instaladas neste repositório para uso do Claude Code.

## Origem

- Repositório: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Plugin: `ui-ux-pro-max` v2.13.0
- Licença: MIT
- Commit de origem: `bc826e2267a36d98a2dcf5231e16c30ff546770f`

Copiadas de `.claude/skills/` do repositório acima. Os diretórios `tests/` e
caches `__pycache__` foram removidos por não serem necessários em runtime.

## Skills disponíveis

| Skill | Para que serve |
|---|---|
| `ui-ux-pro-max` | Base de design pesquisável: 79 estilos, 192 paletas, 74 pares tipográficos, 119 diretrizes de UX, 105 ícones, 25 tipos de gráfico, 22 stacks |
| `ui-styling` | shadcn/ui + Tailwind: componentes acessíveis, temas, dark mode, layouts |
| `design` | Identidade de marca, logo, CIP, slides, banners, ícones, social |
| `design-system` | Design tokens em 3 camadas (primitive → semantic → component), specs de componente |
| `brand` | Voz de marca, identidade visual, frameworks de mensagem |
| `banner-design` | Banners para social, ads, hero de site e impresso |
| `slides` | Apresentações HTML com Chart.js |

## Uso

O Claude Code carrega automaticamente as skills de `.claude/skills/` ao abrir o
projeto. Também é possível invocá-las direto, ex.: `/ui-ux-pro-max`.

Consulta manual à base de dados:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "landing page saas" --domain style -n 3
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech" --design-system -p "Orcalink"
```

Requer apenas Python 3 (sem dependências externas).

## Atualização

```bash
git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill /tmp/uupm
rsync -a --delete /tmp/uupm/.claude/skills/ .claude/skills/
find .claude/skills -type d -name tests -prune -exec rm -rf {} +
```
