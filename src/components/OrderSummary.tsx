interface OrderSummaryProps {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function OrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  total,
}: OrderSummaryProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 sticky top-8">
      <h2 className="text-xl font-semibold mb-6 text-foreground tracking-wide">
        Order Summary
      </h2>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div
            key={`${item.id}-${item.size}-${item.color}`}
            className="flex items-start space-x-4"
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md"
              />
            )}
            <div className="flex-1">
              <h3 className="font-medium text-foreground text-sm">
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.size} • {item.color}
              </p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-muted-foreground">
                  Qty: {item.quantity}
                </span>
                <span className="font-medium text-foreground">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="space-y-2 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-foreground">
            {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span className="text-foreground">${tax.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Free Shipping Notice */}
      {subtotal < 100 && (
        <div className="mt-4 p-3 bg-accent/50 rounded-md">
          <p className="text-sm text-accent-foreground">
            Add ${(100 - subtotal).toFixed(2)} more for free shipping!
          </p>
        </div>
      )}
    </div>
  );
}
