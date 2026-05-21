import { AnimatePresence, motion } from "framer-motion"
import { ChevronRight, ShoppingCart } from "lucide-react"
import { useCurrency } from "@/contexts/currency"

type Props = {
  itemCount: number
  total: number
  onOpen: () => void
}

// Fixed bottom action bar — mobile POS' primary CTA when items are in
// the cart. Always sits above the bottom nav. Hidden until the cart
// has at least one item. Same pattern as Etsy / Shopify checkout bars.
export function FloatingCart({ itemCount, total, onOpen }: Props) {
  const { formatPrice } = useCurrency()
  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(env(safe-area-inset-bottom)+4.5rem)] md:hidden"
        >
          <button
            type="button"
            onClick={onOpen}
            className="pointer-events-auto group relative mx-auto flex w-full max-w-md items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-brand via-brand to-fuchsia-600 px-3 py-2.5 text-brand-foreground shadow-2xl shadow-brand/40 transition-transform active:scale-[0.98] dark:from-primary dark:via-primary dark:to-fuchsia-600 dark:text-primary-foreground"
          >
            {/* Item count badge */}
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <ShoppingCart className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold tabular-nums text-brand shadow-sm dark:text-primary">
                {itemCount}
              </span>
            </span>

            {/* Label + total */}
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-80">
                {itemCount === 1 ? "1 item · charge" : `${itemCount} items · charge`}
              </span>
              <span className="block text-base font-bold tabular-nums leading-tight">
                {formatPrice(total)}
              </span>
            </span>

            {/* CTA arrow */}
            <span className="flex h-11 items-center gap-1 rounded-xl bg-white/15 px-3 text-xs font-bold uppercase tracking-wider">
              Charge
              <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
