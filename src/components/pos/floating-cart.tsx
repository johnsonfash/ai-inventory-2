import { AnimatePresence, motion } from "framer-motion"
import { ChevronUp, ShoppingCart } from "lucide-react"

type Props = {
  itemCount: number
  total: number
  onOpen: () => void
}

// Fixed bottom pill that floats over the catalog. Shows item count +
// running total. Sits above the mobile bottom nav (visible only on
// <md). Hidden when the cart is empty.
export function FloatingCart({ itemCount, total, onOpen }: Props) {
  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom)+5rem)] md:hidden"
        >
          <button
            type="button"
            onClick={onOpen}
            className="pointer-events-auto mx-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-brand px-4 py-3 text-brand-foreground shadow-2xl shadow-brand/40 transition-transform active:scale-[0.98] dark:bg-primary dark:text-primary-foreground"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <ShoppingCart className="h-4 w-4" />
            </span>
            <span className="flex-1 text-left">
              <span className="block text-[11px] uppercase tracking-wider opacity-80">View cart</span>
              <span className="block text-sm font-semibold">
                {itemCount} {itemCount === 1 ? "item" : "items"} · ${total.toFixed(2)}
              </span>
            </span>
            <ChevronUp className="h-4 w-4 opacity-90" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
