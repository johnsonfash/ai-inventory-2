import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Workflow, Edit3, Component as ComponentIcon, AlertTriangle, Play, History, Layers } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { EmptyState } from "@/components/lists/empty-state"
import { useCurrency } from "@/contexts/currency"
import {
  ALLERGEN_LABELS,
  getRecipe,
  loadRecipes,
  loadProductionRuns,
  recipesUsingComponent,
  rollupRecipeCost,
} from "@/lib/inventory/recipes"
import { loadCatalog, type CatalogItem } from "@/lib/pos/storage"

const statusTone: Record<"active" | "draft", StatusTone> = { active: "success", draft: "neutral" }

function buildPriceLookup(): (sku: string) => number | null {
  const map = new Map<string, number>()
  for (const mode of ["retail", "restaurant", "services", "auto"] as const) {
    for (const item of loadCatalog(mode) as CatalogItem[]) {
      if (!map.has(item.sku)) map.set(item.sku, item.price)
    }
  }
  return (sku) => map.get(sku) ?? null
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const { formatPrice } = useCurrency()
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 300)) }, []))

  const recipe = React.useMemo(() => (id ? getRecipe(id) : undefined), [id])
  const priceLookup = React.useMemo(() => buildPriceLookup(), [])
  const allRecipes = React.useMemo(() => loadRecipes(), [])

  if (!recipe) {
    return (
      <PageShell title="Recipe not found" withToolbar>
        <Card><CardContent className="p-0">
          <EmptyState
            Icon={Workflow}
            title="Recipe missing"
            description="This recipe id doesn't exist. Maybe it was deleted."
            action={<Link to="/inventory/recipes"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> Back to recipes</Button></Link>}
          />
        </CardContent></Card>
      </PageShell>
    )
  }

  const cost = rollupRecipeCost(recipe, priceLookup)
  const runs = loadProductionRuns().filter((r) => r.recipeId === recipe.id)
  const consumedBy = recipesUsingComponent(recipe.parentSku)
  const totalProduced = runs.filter((r) => r.committed).reduce((s, r) => s + r.batches * recipe.yield, 0)

  return (
    <PageShell
      title={recipe.name}
      withToolbar
      titleTooltip={
        <>
          Everything that goes into making <strong>{recipe.name}</strong> —
          the components consumed, how much it yields per run, what it
          costs to make, who's making it, and the lots/batches produced
          so far. Edit it to change the recipe; tap "Log production"
          to record a new batch made.
        </>
      }
      mobileTrailing={
        <Link to={`/inventory/recipes/${recipe.id}/edit`}>
          <Button variant="ghost" size="icon" aria-label="Edit recipe"><Edit3 className="h-4 w-4" /></Button>
        </Link>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link to="/inventory/recipes" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> All recipes
          </Link>
          <span>·</span>
          <span className="font-mono">{recipe.parentSku}</span>
          <span>·</span>
          <StatusBadge tone={statusTone[recipe.status]} withDot>{recipe.status}</StatusBadge>
          {recipe.version != null && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">v{recipe.version}</span>}
        </div>

        <SummaryStrip
          tiles={[
            { label: "Cost per unit", value: cost.missing.length > 0 ? "—" : formatPrice(cost.perUnit), tone: "warning", hint: "rolled up" },
            { label: "Yield", value: `${recipe.yield} ${recipe.yieldUnit}`, tone: "brand", hint: "per run" },
            { label: "Components", value: String(recipe.lines.length), tone: "info", hint: "in BOM" },
            { label: "Total produced", value: String(totalProduced), tone: "success", hint: "committed runs" },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/inventory/production?recipeId=${recipe.id}`}>
            <Button><Play className="h-4 w-4" /> Log production run</Button>
          </Link>
          <Link to={`/inventory/recipes/${recipe.id}/edit`}>
            <Button variant="outline"><Edit3 className="h-4 w-4" /> Edit recipe</Button>
          </Link>
        </div>

        {recipe.method && (
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-semibold">Method</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{recipe.method}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Components</h3>
              <span className="text-[11px] text-muted-foreground">Quantities are per single yielded {recipe.yieldUnit}</span>
            </div>
            <ul className="divide-y divide-border">
              {recipe.lines.map((line, i) => {
                const isSubRecipe = allRecipes.some((r) => r.parentSku === line.componentSku)
                const unitCost = priceLookup(line.componentSku)
                const wasteFactor = 1 + (line.wastageFactor ?? 0)
                const lineCost = unitCost != null ? unitCost * line.qty * wasteFactor : null
                return (
                  <li key={i} className="flex items-start gap-3 px-4 py-3">
                    <span className={
                      isSubRecipe
                        ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand"
                        : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                    }>
                      {isSubRecipe ? <Layers className="h-4 w-4" /> : <ComponentIcon className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">
                          {line.componentName ?? line.componentSku}
                          {isSubRecipe && <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">SUB-RECIPE</span>}
                        </p>
                        <span className="shrink-0 font-mono text-sm tabular-nums">
                          {line.qty} {line.unit}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-muted-foreground">{line.componentSku}</p>
                      {line.notes && <p className="mt-1 text-[11px] italic text-muted-foreground">{line.notes}</p>}
                      <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          {line.wastageFactor ? (
                            <span className="text-amber-700 dark:text-amber-400">+{Math.round((line.wastageFactor ?? 0) * 100)}% wastage</span>
                          ) : null}
                        </div>
                        <span className="text-muted-foreground">
                          {lineCost != null ? `Line cost: ${formatPrice(lineCost)}` : "no cost data"}
                        </span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>

        {cost.missing.length > 0 && (
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Cost rollup incomplete</p>
                <p className="text-[11px] text-muted-foreground">
                  {cost.missing.length} component(s) don't have a cost in the catalog yet:{" "}
                  <span className="font-mono">{cost.missing.join(", ")}</span>. Add them to inventory to enable the full cost rollup.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {recipe.allergens.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-semibold">Allergens</h3>
              <div className="flex flex-wrap gap-1.5">
                {recipe.allergens.map((a) => (
                  <span key={a} className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                    {ALLERGEN_LABELS[a]}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Surfaced on the storefront menu + customer-facing labels. Auto-rolled
                up from components; override on the recipe form.
              </p>
            </CardContent>
          </Card>
        )}

        {recipe.nutrition && (
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-semibold">Nutrition (per {recipe.yieldUnit})</h3>
              <div className="grid grid-cols-3 gap-3 text-xs sm:grid-cols-6">
                {recipe.nutrition.kcal != null && <Stat label="Calories" value={`${recipe.nutrition.kcal}`} suffix="kcal" />}
                {recipe.nutrition.proteinG != null && <Stat label="Protein" value={`${recipe.nutrition.proteinG}`} suffix="g" />}
                {recipe.nutrition.carbsG != null && <Stat label="Carbs" value={`${recipe.nutrition.carbsG}`} suffix="g" />}
                {recipe.nutrition.fatG != null && <Stat label="Fat" value={`${recipe.nutrition.fatG}`} suffix="g" />}
                {recipe.nutrition.fiberG != null && <Stat label="Fiber" value={`${recipe.nutrition.fiberG}`} suffix="g" />}
                {recipe.nutrition.sodiumMg != null && <Stat label="Sodium" value={`${recipe.nutrition.sodiumMg}`} suffix="mg" />}
              </div>
            </CardContent>
          </Card>
        )}

        {consumedBy.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-semibold">Used by ({consumedBy.length})</h3>
              <p className="mb-2 text-[11px] text-muted-foreground">
                Recipes that reference this one as a sub-recipe. Editing this
                recipe affects all of them.
              </p>
              <ul className="space-y-1">
                {consumedBy.map((r) => (
                  <li key={r.id}>
                    <Link to={`/inventory/recipes/${r.id}`} className="text-sm hover:underline">
                      {r.name} <span className="font-mono text-[11px] text-muted-foreground">({r.parentSku})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {runs.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="border-b border-border px-4 py-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2"><History className="h-4 w-4" /> Production history</h3>
                <Link to={`/inventory/production?recipeId=${recipe.id}`} className="text-[11px] text-brand hover:underline">All runs →</Link>
              </div>
              <ul className="divide-y divide-border">
                {runs.slice(0, 8).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm">
                        {r.batches} run × {recipe.yield} {recipe.yieldUnit} = <span className="font-semibold">{r.batches * recipe.yield}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(r.ranAt).toLocaleString()}
                        {r.lotCode && <> · lot <span className="font-mono">{r.lotCode}</span></>}
                        {r.expiresAt && <> · exp {new Date(r.expiresAt).toLocaleDateString()}</>}
                      </p>
                    </div>
                    <StatusBadge tone={r.committed ? "success" : "neutral"} withDot>
                      {r.committed ? "committed" : "draft"}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  )
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-bold tabular-nums">
        {value}<span className="ml-0.5 text-[10px] font-normal text-muted-foreground">{suffix}</span>
      </p>
    </div>
  )
}
