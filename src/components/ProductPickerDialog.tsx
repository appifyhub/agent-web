import React from "react";
import { Coffee, ExternalLink, Infinity as InfinityIcon, PackagePlus, ShoppingCart, X } from "lucide-react";
import { t } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { Product } from "@/services/purchase-service";
import {
  getProductSlug,
  trackFeatureAction,
  type AnalyticsPageId,
} from "@/lib/analytics";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// products are identified by their credit amount rather than opaque vendor
// ids, so the shop needs no per-product id constants; donations carry no credits
const isDonation = (product: Product): boolean => product.credits <= 0;

function getProductLabel(product: Product): string {
  switch (getProductSlug(product.credits)) {
    case "donation": return t("products.shop.donation");
    case "pack_100": return t("products.shop.pack_100");
    case "pack_200": return t("products.shop.pack_200");
    case "pack_300": return t("products.shop.pack_300");
    case "pack_500": return t("products.shop.pack_500");
    case "pack_1000": return t("products.shop.pack_1000");
    case "pack_2000": return t("products.shop.pack_2000");
    case "pack_3000": return t("products.shop.pack_3000");
    case "pack_5000": return t("products.shop.pack_5000");
    case "pack_10000": return t("products.shop.pack_10000");
    default: return product.name;
  }
}

function getListItemClasses(index: number, total: number): string {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  if (isFirst && isLast) return "rounded-2xl border-t-1";
  if (isFirst) return "rounded-t-2xl border-t-1";
  if (isLast) return "rounded-b-2xl border-t-0";
  return "border-t-0";
}

interface ProductPickerContentProps {
  products: Product[];
  sourceArea: AnalyticsPageId;
  shopUrl?: string;
  onClose: () => void;
}

const ProductPickerContent: React.FC<ProductPickerContentProps> = ({
  products,
  sourceArea,
  shopUrl,
  onClose,
}) => {
  const donationProduct = products.find(isDonation);
  const creditPacks = products.filter((p) => !isDonation(p));

  type CtaItem = {
    url: string;
    label: string;
    optionId: string;
    icon: React.ReactNode;
    itemClassName: string;
  };
  const ctaItems: CtaItem[] = [];
  if (donationProduct) {
    ctaItems.push({
      url: donationProduct.url,
      label: getProductLabel(donationProduct),
      optionId: getProductSlug(donationProduct.credits) ?? "donation",
      icon: <Coffee className="h-4 w-4 shrink-0 text-teal-200" />,
      itemClassName: "bg-[oklch(0.25_0.06_160)]/60 border border-teal-400/20",
    });
  }
  if (shopUrl) {
    ctaItems.push({
      url: shopUrl,
      label: t("products.shop.open_shop"),
      optionId: "shop",
      icon: <InfinityIcon className="h-4 w-4 shrink-0 text-teal-200" />,
      itemClassName: "bg-[oklch(0.25_0.06_160)]/60 border border-teal-400/20",
    });
  }

  return (
    <div className="mt-[2rem] space-y-8">
      {ctaItems.length > 0 && (
        <div className="flex flex-col space-y-0">
          {ctaItems.map((item, index) => (
            <a
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackFeatureAction({
                  featureId: "product_link",
                  action: "open",
                  optionId: item.optionId,
                  sourceArea,
                });
                onClose();
              }}
              className={cn(
                "flex items-center justify-between px-5 py-4 border cursor-pointer w-full",
                getListItemClasses(index, ctaItems.length),
                item.itemClassName,
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <ExternalLink className="h-4 w-4 text-teal-200 hover:text-teal-100 transition-colors shrink-0" />
            </a>
          ))}
        </div>
      )}

      {creditPacks.length > 0 && (
        <>
          <h3 className="text-sm font-medium uppercase tracking-wider px-1 text-blue-300">
            {t("products.shop.credit_packs")}
          </h3>
          <div className="flex flex-col space-y-0">
            {creditPacks.map((product, index) => (
              <a
                key={product.id}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackFeatureAction({
                    featureId: "product_link",
                    action: "open",
                    optionId: getProductSlug(product.credits),
                    sourceArea,
                  });
                  onClose();
                }}
                className={cn(
                  "flex items-center justify-between px-5 py-4 bg-surface-subtle/50 border cursor-pointer w-full",
                  getListItemClasses(index, creditPacks.length),
                )}
              >
                <div className="flex items-center gap-3">
                  <PackagePlus className="h-4 w-4 shrink-0 text-blue-300" />
                  <span className="text-sm font-medium">
                    {getProductLabel(product)}
                  </span>
                </div>
                <ExternalLink className="h-4 w-4 text-blue-300 hover:text-blue-400 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface ProductPickerDialogProps {
  products: Product[];
  sourceArea: AnalyticsPageId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopUrl?: string;
}

const ProductPickerDialog: React.FC<ProductPickerDialogProps> = ({
  products,
  open,
  onOpenChange,
  shopUrl,
  sourceArea,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex max-h-[calc(100dvh-3rem)] flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/90 p-[2.5rem] sm:max-w-[500px]"
          showCloseButton={false}
        >
          <DialogClose className="absolute top-8 right-8 bg-surface-raised/50 border border-border/60 rounded-full cursor-pointer h-7 w-7 flex items-center justify-center">
            <X className="h-4 w-4" />
            <span className="sr-only">{t("close")}</span>
          </DialogClose>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 opacity-80 shrink-0" />
              <DialogTitle className="text-white">{t("products.shop.title")}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto pe-1">
            <ProductPickerContent
              products={products}
              shopUrl={shopUrl}
              sourceArea={sourceArea}
              onClose={() => onOpenChange(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-card/90 border border-border/80 p-[1rem] pb-[max(2rem,env(safe-area-inset-bottom))] rounded-t-3xl">
        <DrawerHeader className="mt-[2rem]">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 opacity-80 shrink-0" />
            <DrawerTitle className="text-white">{t("products.shop.title")}</DrawerTitle>
          </div>
        </DrawerHeader>
        <ProductPickerContent
          products={products}
          sourceArea={sourceArea}
          shopUrl={shopUrl}
          onClose={() => onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default ProductPickerDialog;
