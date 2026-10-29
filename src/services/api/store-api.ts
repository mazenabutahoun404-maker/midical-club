import { type ApiClient, type ApiInput } from "./client";
import { engagementCommand } from "./engagement-contracts";
import { prepareStoreInput, validateStoreResponse } from "./store-contracts";
import { assertOwner } from "./mapping";
export function createHttpStoreApi(api: ApiClient) {
  const command = engagementCommand(api);
  return {
    get_api_v1_store_categories: async (
      input: ApiInput<"get_api_v1_store_categories">,
    ) => {
      prepareStoreInput("get_api_v1_store_categories", input);
      return validateStoreResponse(
        "get_api_v1_store_categories",
        await api.call("get_api_v1_store_categories", input),
      );
    },
    get_api_v1_store_products: async (
      input: ApiInput<"get_api_v1_store_products">,
    ) => {
      prepareStoreInput("get_api_v1_store_products", input);
      return validateStoreResponse(
        "get_api_v1_store_products",
        await api.call("get_api_v1_store_products", input),
      );
    },
    get_api_v1_store_products_by_productId: async (
      input: ApiInput<"get_api_v1_store_products_by_productId">,
    ) => {
      prepareStoreInput("get_api_v1_store_products_by_productId", input);
      return validateStoreResponse(
        "get_api_v1_store_products_by_productId",
        await api.call("get_api_v1_store_products_by_productId", input),
      );
    },
    get_api_v1_store_admin_categories: async (
      input: ApiInput<"get_api_v1_store_admin_categories">,
    ) => {
      prepareStoreInput("get_api_v1_store_admin_categories", input);
      return validateStoreResponse(
        "get_api_v1_store_admin_categories",
        await api.call("get_api_v1_store_admin_categories", input),
      );
    },
    post_api_v1_store_admin_categories: async (
      input: ApiInput<"post_api_v1_store_admin_categories">,
    ) => {
      prepareStoreInput("post_api_v1_store_admin_categories", input);
      return command("post_api_v1_store_admin_categories", input, async (key) =>
        validateStoreResponse(
          "post_api_v1_store_admin_categories",
          await api.call("post_api_v1_store_admin_categories", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    put_api_v1_store_admin_categories_by_id: async (
      input: ApiInput<"put_api_v1_store_admin_categories_by_id">,
    ) => {
      prepareStoreInput("put_api_v1_store_admin_categories_by_id", input);
      return command(
        "put_api_v1_store_admin_categories_by_id",
        input,
        async (key) =>
          validateStoreResponse(
            "put_api_v1_store_admin_categories_by_id",
            await api.call("put_api_v1_store_admin_categories_by_id", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_store_admin_categories_by_id_archive: async (
      input: ApiInput<"post_api_v1_store_admin_categories_by_id_archive">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_categories_by_id_archive",
        input,
      );
      return command(
        "post_api_v1_store_admin_categories_by_id_archive",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_categories_by_id_archive",
            await api.call("post_api_v1_store_admin_categories_by_id_archive", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_store_admin_products: async (
      input: ApiInput<"get_api_v1_store_admin_products">,
    ) => {
      prepareStoreInput("get_api_v1_store_admin_products", input);
      return validateStoreResponse(
        "get_api_v1_store_admin_products",
        await api.call("get_api_v1_store_admin_products", input),
      );
    },
    post_api_v1_store_admin_products: async (
      input: ApiInput<"post_api_v1_store_admin_products">,
    ) => {
      prepareStoreInput("post_api_v1_store_admin_products", input);
      return command("post_api_v1_store_admin_products", input, async (key) =>
        validateStoreResponse(
          "post_api_v1_store_admin_products",
          await api.call("post_api_v1_store_admin_products", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    get_api_v1_store_admin_products_by_id: async (
      input: ApiInput<"get_api_v1_store_admin_products_by_id">,
    ) => {
      prepareStoreInput("get_api_v1_store_admin_products_by_id", input);
      return validateStoreResponse(
        "get_api_v1_store_admin_products_by_id",
        await api.call("get_api_v1_store_admin_products_by_id", input),
      );
    },
    put_api_v1_store_admin_products_by_id: async (
      input: ApiInput<"put_api_v1_store_admin_products_by_id">,
    ) => {
      prepareStoreInput("put_api_v1_store_admin_products_by_id", input);
      return command(
        "put_api_v1_store_admin_products_by_id",
        input,
        async (key) =>
          validateStoreResponse(
            "put_api_v1_store_admin_products_by_id",
            await api.call("put_api_v1_store_admin_products_by_id", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_store_admin_products_by_id_activate: async (
      input: ApiInput<"post_api_v1_store_admin_products_by_id_activate">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_products_by_id_activate",
        input,
      );
      return command(
        "post_api_v1_store_admin_products_by_id_activate",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_products_by_id_activate",
            await api.call("post_api_v1_store_admin_products_by_id_activate", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_store_admin_products_by_id_archive: async (
      input: ApiInput<"post_api_v1_store_admin_products_by_id_archive">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_products_by_id_archive",
        input,
      );
      return command(
        "post_api_v1_store_admin_products_by_id_archive",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_products_by_id_archive",
            await api.call("post_api_v1_store_admin_products_by_id_archive", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_store_admin_products_by_id_assets: async (
      input: ApiInput<"post_api_v1_store_admin_products_by_id_assets">,
    ) => {
      prepareStoreInput("post_api_v1_store_admin_products_by_id_assets", input);
      return command(
        "post_api_v1_store_admin_products_by_id_assets",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_products_by_id_assets",
            await api.call("post_api_v1_store_admin_products_by_id_assets", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    delete_api_v1_store_admin_products_by_id_assets_by_assetLinkId: async (
      input: ApiInput<"delete_api_v1_store_admin_products_by_id_assets_by_assetLinkId">,
    ) => {
      prepareStoreInput(
        "delete_api_v1_store_admin_products_by_id_assets_by_assetLinkId",
        input,
      );
      return command(
        "delete_api_v1_store_admin_products_by_id_assets_by_assetLinkId",
        input,
        async (key) =>
          validateStoreResponse(
            "delete_api_v1_store_admin_products_by_id_assets_by_assetLinkId",
            await api.call(
              "delete_api_v1_store_admin_products_by_id_assets_by_assetLinkId",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_store_admin_products_by_id_variants: async (
      input: ApiInput<"post_api_v1_store_admin_products_by_id_variants">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_products_by_id_variants",
        input,
      );
      return command(
        "post_api_v1_store_admin_products_by_id_variants",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_products_by_id_variants",
            await api.call("post_api_v1_store_admin_products_by_id_variants", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    put_api_v1_store_admin_variants_by_variantId: async (
      input: ApiInput<"put_api_v1_store_admin_variants_by_variantId">,
    ) => {
      prepareStoreInput("put_api_v1_store_admin_variants_by_variantId", input);
      return command(
        "put_api_v1_store_admin_variants_by_variantId",
        input,
        async (key) =>
          validateStoreResponse(
            "put_api_v1_store_admin_variants_by_variantId",
            await api.call("put_api_v1_store_admin_variants_by_variantId", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_store_admin_variants_by_variantId_archive: async (
      input: ApiInput<"post_api_v1_store_admin_variants_by_variantId_archive">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_variants_by_variantId_archive",
        input,
      );
      return command(
        "post_api_v1_store_admin_variants_by_variantId_archive",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_variants_by_variantId_archive",
            await api.call(
              "post_api_v1_store_admin_variants_by_variantId_archive",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    put_api_v1_store_admin_variants_by_variantId_inventory_cost: async (
      input: ApiInput<"put_api_v1_store_admin_variants_by_variantId_inventory_cost">,
    ) => {
      prepareStoreInput(
        "put_api_v1_store_admin_variants_by_variantId_inventory_cost",
        input,
      );
      return command(
        "put_api_v1_store_admin_variants_by_variantId_inventory_cost",
        input,
        async (key) =>
          validateStoreResponse(
            "put_api_v1_store_admin_variants_by_variantId_inventory_cost",
            await api.call(
              "put_api_v1_store_admin_variants_by_variantId_inventory_cost",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    get_api_v1_store_admin_variants_by_variantId_inventory: async (
      input: ApiInput<"get_api_v1_store_admin_variants_by_variantId_inventory">,
    ) => {
      prepareStoreInput(
        "get_api_v1_store_admin_variants_by_variantId_inventory",
        input,
      );
      return validateStoreResponse(
        "get_api_v1_store_admin_variants_by_variantId_inventory",
        await api.call(
          "get_api_v1_store_admin_variants_by_variantId_inventory",
          input,
        ),
      );
    },
    get_api_v1_store_admin_variants_by_variantId_inventory_history: async (
      input: ApiInput<"get_api_v1_store_admin_variants_by_variantId_inventory_history">,
    ) => {
      prepareStoreInput(
        "get_api_v1_store_admin_variants_by_variantId_inventory_history",
        input,
      );
      return validateStoreResponse(
        "get_api_v1_store_admin_variants_by_variantId_inventory_history",
        await api.call(
          "get_api_v1_store_admin_variants_by_variantId_inventory_history",
          input,
        ),
      );
    },
    post_api_v1_store_admin_variants_by_variantId_inventory_adjustments: async (
      input: ApiInput<"post_api_v1_store_admin_variants_by_variantId_inventory_adjustments">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_variants_by_variantId_inventory_adjustments",
        input,
      );
      return command(
        "post_api_v1_store_admin_variants_by_variantId_inventory_adjustments",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_variants_by_variantId_inventory_adjustments",
            await api.call(
              "post_api_v1_store_admin_variants_by_variantId_inventory_adjustments",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_store_admin_inventory_rebuild: async (
      input: ApiInput<"post_api_v1_store_admin_inventory_rebuild">,
    ) => {
      prepareStoreInput("post_api_v1_store_admin_inventory_rebuild", input);
      return command(
        "post_api_v1_store_admin_inventory_rebuild",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_inventory_rebuild",
            await api.call("post_api_v1_store_admin_inventory_rebuild", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_store_admin_settings: async (
      input: ApiInput<"get_api_v1_store_admin_settings">,
    ) => {
      prepareStoreInput("get_api_v1_store_admin_settings", input);
      return validateStoreResponse(
        "get_api_v1_store_admin_settings",
        await api.call("get_api_v1_store_admin_settings", input),
      );
    },
    put_api_v1_store_admin_settings: async (
      input: ApiInput<"put_api_v1_store_admin_settings">,
    ) => {
      prepareStoreInput("put_api_v1_store_admin_settings", input);
      return command("put_api_v1_store_admin_settings", input, async (key) =>
        validateStoreResponse(
          "put_api_v1_store_admin_settings",
          await api.call("put_api_v1_store_admin_settings", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    get_api_v1_store_admin_monitoring: async (
      input: ApiInput<"get_api_v1_store_admin_monitoring">,
    ) => {
      prepareStoreInput("get_api_v1_store_admin_monitoring", input);
      return validateStoreResponse(
        "get_api_v1_store_admin_monitoring",
        await api.call("get_api_v1_store_admin_monitoring", input),
      );
    },
    post_api_v1_store_admin_monitoring_jobs_by_id_retry: async (
      input: ApiInput<"post_api_v1_store_admin_monitoring_jobs_by_id_retry">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_monitoring_jobs_by_id_retry",
        input,
      );
      return command(
        "post_api_v1_store_admin_monitoring_jobs_by_id_retry",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_monitoring_jobs_by_id_retry",
            await api.call(
              "post_api_v1_store_admin_monitoring_jobs_by_id_retry",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    get_api_v1_store_cart: async (input: ApiInput<"get_api_v1_store_cart">) => {
      prepareStoreInput("get_api_v1_store_cart", input);
      return validateStoreResponse(
        "get_api_v1_store_cart",
        await api.call("get_api_v1_store_cart", input),
      );
    },
    delete_api_v1_store_cart: async (
      input: ApiInput<"delete_api_v1_store_cart">,
    ) => {
      prepareStoreInput("delete_api_v1_store_cart", input);
      return validateStoreResponse(
        "delete_api_v1_store_cart",
        await api.call("delete_api_v1_store_cart", input),
      );
    },
    put_api_v1_store_cart_items_by_variantId: async (
      input: ApiInput<"put_api_v1_store_cart_items_by_variantId">,
    ) => {
      prepareStoreInput("put_api_v1_store_cart_items_by_variantId", input);
      return validateStoreResponse(
        "put_api_v1_store_cart_items_by_variantId",
        await api.call("put_api_v1_store_cart_items_by_variantId", input),
      );
    },
    delete_api_v1_store_cart_items_by_itemId: async (
      input: ApiInput<"delete_api_v1_store_cart_items_by_itemId">,
    ) => {
      prepareStoreInput("delete_api_v1_store_cart_items_by_itemId", input);
      return validateStoreResponse(
        "delete_api_v1_store_cart_items_by_itemId",
        await api.call("delete_api_v1_store_cart_items_by_itemId", input),
      );
    },
    post_api_v1_store_orders: async (
      input: ApiInput<"post_api_v1_store_orders">,
    ) => {
      prepareStoreInput("post_api_v1_store_orders", input);
      return command("post_api_v1_store_orders", input, async (key) =>
        validateStoreResponse(
          "post_api_v1_store_orders",
          await api.call("post_api_v1_store_orders", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    get_api_v1_store_orders_my: async (
      input: ApiInput<"get_api_v1_store_orders_my">,
    ) => {
      prepareStoreInput("get_api_v1_store_orders_my", input);
      return validateStoreResponse(
        "get_api_v1_store_orders_my",
        await api.call("get_api_v1_store_orders_my", input),
      );
    },
    get_api_v1_store_orders_my_by_orderId: async (
      input: ApiInput<"get_api_v1_store_orders_my_by_orderId">,
    ) => {
      prepareStoreInput("get_api_v1_store_orders_my_by_orderId", input);
      return validateStoreResponse(
        "get_api_v1_store_orders_my_by_orderId",
        await api.call("get_api_v1_store_orders_my_by_orderId", input),
      );
    },
    post_api_v1_store_orders_my_by_orderId_cancel: async (
      input: ApiInput<"post_api_v1_store_orders_my_by_orderId_cancel">,
    ) => {
      prepareStoreInput("post_api_v1_store_orders_my_by_orderId_cancel", input);
      return command(
        "post_api_v1_store_orders_my_by_orderId_cancel",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_orders_my_by_orderId_cancel",
            await api.call("post_api_v1_store_orders_my_by_orderId_cancel", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_store_orders_my_by_orderId_pickup_code: async (
      input: ApiInput<"get_api_v1_store_orders_my_by_orderId_pickup_code">,
    ) => {
      prepareStoreInput(
        "get_api_v1_store_orders_my_by_orderId_pickup_code",
        input,
      );
      return validateStoreResponse(
        "get_api_v1_store_orders_my_by_orderId_pickup_code",
        await api.call(
          "get_api_v1_store_orders_my_by_orderId_pickup_code",
          input,
        ),
      );
    },
    get_api_v1_store_admin_orders: async (
      input: ApiInput<"get_api_v1_store_admin_orders">,
    ) => {
      prepareStoreInput("get_api_v1_store_admin_orders", input);
      return validateStoreResponse(
        "get_api_v1_store_admin_orders",
        await api.call("get_api_v1_store_admin_orders", input),
      );
    },
    get_api_v1_store_admin_orders_by_orderId: async (
      input: ApiInput<"get_api_v1_store_admin_orders_by_orderId">,
    ) => {
      prepareStoreInput("get_api_v1_store_admin_orders_by_orderId", input);
      return validateStoreResponse(
        "get_api_v1_store_admin_orders_by_orderId",
        await api.call("get_api_v1_store_admin_orders_by_orderId", input),
      );
    },
    post_api_v1_store_admin_orders_by_orderId_confirm: async (
      input: ApiInput<"post_api_v1_store_admin_orders_by_orderId_confirm">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_orders_by_orderId_confirm",
        input,
      );
      return command(
        "post_api_v1_store_admin_orders_by_orderId_confirm",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_orders_by_orderId_confirm",
            await api.call(
              "post_api_v1_store_admin_orders_by_orderId_confirm",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_store_admin_orders_by_orderId_reject: async (
      input: ApiInput<"post_api_v1_store_admin_orders_by_orderId_reject">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_orders_by_orderId_reject",
        input,
      );
      return command(
        "post_api_v1_store_admin_orders_by_orderId_reject",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_orders_by_orderId_reject",
            await api.call("post_api_v1_store_admin_orders_by_orderId_reject", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_store_admin_orders_by_orderId_ready_for_pickup: async (
      input: ApiInput<"post_api_v1_store_admin_orders_by_orderId_ready_for_pickup">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_orders_by_orderId_ready_for_pickup",
        input,
      );
      return command(
        "post_api_v1_store_admin_orders_by_orderId_ready_for_pickup",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_orders_by_orderId_ready_for_pickup",
            await api.call(
              "post_api_v1_store_admin_orders_by_orderId_ready_for_pickup",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_store_admin_orders_by_orderId_complete: async (
      input: ApiInput<"post_api_v1_store_admin_orders_by_orderId_complete">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_orders_by_orderId_complete",
        input,
      );
      return command(
        "post_api_v1_store_admin_orders_by_orderId_complete",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_orders_by_orderId_complete",
            await api.call(
              "post_api_v1_store_admin_orders_by_orderId_complete",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_store_admin_orders_by_orderId_complete_with_override: async (
      input: ApiInput<"post_api_v1_store_admin_orders_by_orderId_complete_with_override">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_orders_by_orderId_complete_with_override",
        input,
      );
      return command(
        "post_api_v1_store_admin_orders_by_orderId_complete_with_override",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_orders_by_orderId_complete_with_override",
            await api.call(
              "post_api_v1_store_admin_orders_by_orderId_complete_with_override",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_store_admin_orders_by_orderId_cancel: async (
      input: ApiInput<"post_api_v1_store_admin_orders_by_orderId_cancel">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_orders_by_orderId_cancel",
        input,
      );
      return command(
        "post_api_v1_store_admin_orders_by_orderId_cancel",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_orders_by_orderId_cancel",
            await api.call("post_api_v1_store_admin_orders_by_orderId_cancel", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_store_admin_orders_by_orderId_extend_pickup_deadline: async (
      input: ApiInput<"post_api_v1_store_admin_orders_by_orderId_extend_pickup_deadline">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_orders_by_orderId_extend_pickup_deadline",
        input,
      );
      return command(
        "post_api_v1_store_admin_orders_by_orderId_extend_pickup_deadline",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_orders_by_orderId_extend_pickup_deadline",
            await api.call(
              "post_api_v1_store_admin_orders_by_orderId_extend_pickup_deadline",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_store_admin_orders_by_orderId_regenerate_pickup_code: async (
      input: ApiInput<"post_api_v1_store_admin_orders_by_orderId_regenerate_pickup_code">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_orders_by_orderId_regenerate_pickup_code",
        input,
      );
      return command(
        "post_api_v1_store_admin_orders_by_orderId_regenerate_pickup_code",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_orders_by_orderId_regenerate_pickup_code",
            await api.call(
              "post_api_v1_store_admin_orders_by_orderId_regenerate_pickup_code",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_store_admin_orders_by_orderId_cash_corrections: async (
      input: ApiInput<"post_api_v1_store_admin_orders_by_orderId_cash_corrections">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_orders_by_orderId_cash_corrections",
        input,
      );
      return command(
        "post_api_v1_store_admin_orders_by_orderId_cash_corrections",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_orders_by_orderId_cash_corrections",
            await api.call(
              "post_api_v1_store_admin_orders_by_orderId_cash_corrections",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    get_api_v1_store_admin_reports_by_report: async (
      input: ApiInput<"get_api_v1_store_admin_reports_by_report">,
    ) => {
      prepareStoreInput("get_api_v1_store_admin_reports_by_report", input);
      return validateStoreResponse(
        "get_api_v1_store_admin_reports_by_report",
        await api.call("get_api_v1_store_admin_reports_by_report", input),
      );
    },
    post_api_v1_store_admin_reports_exports: async (
      input: ApiInput<"post_api_v1_store_admin_reports_exports">,
    ) => {
      prepareStoreInput("post_api_v1_store_admin_reports_exports", input);
      return command(
        "post_api_v1_store_admin_reports_exports",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_reports_exports",
            await api.call("post_api_v1_store_admin_reports_exports", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_store_admin_reports_exports_by_id: async (
      input: ApiInput<"get_api_v1_store_admin_reports_exports_by_id">,
    ) => {
      prepareStoreInput("get_api_v1_store_admin_reports_exports_by_id", input);
      return validateStoreResponse(
        "get_api_v1_store_admin_reports_exports_by_id",
        await api.call("get_api_v1_store_admin_reports_exports_by_id", input),
      );
    },
    get_api_v1_store_orders_my_by_orderId_returnable_items: async (
      input: ApiInput<"get_api_v1_store_orders_my_by_orderId_returnable_items">,
    ) => {
      prepareStoreInput(
        "get_api_v1_store_orders_my_by_orderId_returnable_items",
        input,
      );
      return validateStoreResponse(
        "get_api_v1_store_orders_my_by_orderId_returnable_items",
        await api.call(
          "get_api_v1_store_orders_my_by_orderId_returnable_items",
          input,
        ),
      );
    },
    post_api_v1_store_orders_my_by_orderId_returns: async (
      input: ApiInput<"post_api_v1_store_orders_my_by_orderId_returns">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_orders_my_by_orderId_returns",
        input,
      );
      return command(
        "post_api_v1_store_orders_my_by_orderId_returns",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_orders_my_by_orderId_returns",
            await api.call("post_api_v1_store_orders_my_by_orderId_returns", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    get_api_v1_store_returns_my: async (
      input: ApiInput<"get_api_v1_store_returns_my">,
    ) => {
      prepareStoreInput("get_api_v1_store_returns_my", input);
      return validateStoreResponse(
        "get_api_v1_store_returns_my",
        await api.call("get_api_v1_store_returns_my", input),
      );
    },
    get_api_v1_store_returns_my_by_returnId: async (
      input: ApiInput<"get_api_v1_store_returns_my_by_returnId">,
    ) => {
      prepareStoreInput("get_api_v1_store_returns_my_by_returnId", input);
      return validateStoreResponse(
        "get_api_v1_store_returns_my_by_returnId",
        await api.call("get_api_v1_store_returns_my_by_returnId", input),
      );
    },
    post_api_v1_store_returns_my_by_returnId_cancel: async (
      input: ApiInput<"post_api_v1_store_returns_my_by_returnId_cancel">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_returns_my_by_returnId_cancel",
        input,
      );
      return command(
        "post_api_v1_store_returns_my_by_returnId_cancel",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_returns_my_by_returnId_cancel",
            await api.call("post_api_v1_store_returns_my_by_returnId_cancel", {
              ...input,
              idempotencyKey: key,
            }),
          ),
      );
    },
    post_api_v1_store_returns_my_by_returnId_evidence: async (
      input: ApiInput<"post_api_v1_store_returns_my_by_returnId_evidence">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_returns_my_by_returnId_evidence",
        input,
      );
      return command(
        "post_api_v1_store_returns_my_by_returnId_evidence",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_returns_my_by_returnId_evidence",
            await api.call(
              "post_api_v1_store_returns_my_by_returnId_evidence",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    delete_api_v1_store_returns_my_by_returnId_evidence_by_assetId: async (
      input: ApiInput<"delete_api_v1_store_returns_my_by_returnId_evidence_by_assetId">,
    ) => {
      prepareStoreInput(
        "delete_api_v1_store_returns_my_by_returnId_evidence_by_assetId",
        input,
      );
      return command(
        "delete_api_v1_store_returns_my_by_returnId_evidence_by_assetId",
        input,
        async (key) =>
          validateStoreResponse(
            "delete_api_v1_store_returns_my_by_returnId_evidence_by_assetId",
            await api.call(
              "delete_api_v1_store_returns_my_by_returnId_evidence_by_assetId",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    get_api_v1_store_admin_orders_by_orderId_returnable_items: async (
      input: ApiInput<"get_api_v1_store_admin_orders_by_orderId_returnable_items">,
    ) => {
      prepareStoreInput(
        "get_api_v1_store_admin_orders_by_orderId_returnable_items",
        input,
      );
      return validateStoreResponse(
        "get_api_v1_store_admin_orders_by_orderId_returnable_items",
        await api.call(
          "get_api_v1_store_admin_orders_by_orderId_returnable_items",
          input,
        ),
      );
    },
    post_api_v1_store_admin_orders_by_orderId_returns: async (
      input: ApiInput<"post_api_v1_store_admin_orders_by_orderId_returns">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_orders_by_orderId_returns",
        input,
      );
      return command(
        "post_api_v1_store_admin_orders_by_orderId_returns",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_orders_by_orderId_returns",
            await api.call(
              "post_api_v1_store_admin_orders_by_orderId_returns",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    get_api_v1_store_admin_returns: async (
      input: ApiInput<"get_api_v1_store_admin_returns">,
    ) => {
      prepareStoreInput("get_api_v1_store_admin_returns", input);
      return validateStoreResponse(
        "get_api_v1_store_admin_returns",
        await api.call("get_api_v1_store_admin_returns", input),
      );
    },
    get_api_v1_store_admin_returns_by_returnId: async (
      input: ApiInput<"get_api_v1_store_admin_returns_by_returnId">,
    ) => {
      prepareStoreInput("get_api_v1_store_admin_returns_by_returnId", input);
      return validateStoreResponse(
        "get_api_v1_store_admin_returns_by_returnId",
        await api.call("get_api_v1_store_admin_returns_by_returnId", input),
      );
    },
    post_api_v1_store_admin_returns_by_returnId_approve: async (
      input: ApiInput<"post_api_v1_store_admin_returns_by_returnId_approve">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_returns_by_returnId_approve",
        input,
      );
      return command(
        "post_api_v1_store_admin_returns_by_returnId_approve",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_returns_by_returnId_approve",
            await api.call(
              "post_api_v1_store_admin_returns_by_returnId_approve",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_store_admin_returns_by_returnId_reject: async (
      input: ApiInput<"post_api_v1_store_admin_returns_by_returnId_reject">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_returns_by_returnId_reject",
        input,
      );
      return command(
        "post_api_v1_store_admin_returns_by_returnId_reject",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_returns_by_returnId_reject",
            await api.call(
              "post_api_v1_store_admin_returns_by_returnId_reject",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_store_admin_returns_by_returnId_complete: async (
      input: ApiInput<"post_api_v1_store_admin_returns_by_returnId_complete">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_returns_by_returnId_complete",
        input,
      );
      return command(
        "post_api_v1_store_admin_returns_by_returnId_complete",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_returns_by_returnId_complete",
            await api.call(
              "post_api_v1_store_admin_returns_by_returnId_complete",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
    post_api_v1_store_admin_returns_by_returnId_cancel: async (
      input: ApiInput<"post_api_v1_store_admin_returns_by_returnId_cancel">,
    ) => {
      prepareStoreInput(
        "post_api_v1_store_admin_returns_by_returnId_cancel",
        input,
      );
      return command(
        "post_api_v1_store_admin_returns_by_returnId_cancel",
        input,
        async (key) =>
          validateStoreResponse(
            "post_api_v1_store_admin_returns_by_returnId_cancel",
            await api.call(
              "post_api_v1_store_admin_returns_by_returnId_cancel",
              { ...input, idempotencyKey: key },
            ),
          ),
      );
    },
  };
}
export type StoreApi = ReturnType<typeof createHttpStoreApi>;
export function bindStoreSession(api: ApiClient, service: StoreApi) {
  const owner = api.session.get()?.sessionId;
  return new Proxy(service, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      return typeof value === "function"
        ? (...args: unknown[]) => {
            assertOwner(api, owner);
            return value(...args);
          }
        : value;
    },
  });
}
