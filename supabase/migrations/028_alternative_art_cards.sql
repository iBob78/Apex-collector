ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS variant_of_card_id TEXT;

CREATE INDEX IF NOT EXISTS cards_variant_of_card_id_idx
  ON public.cards (variant_of_card_id)
  WHERE variant_of_card_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_alternative_art_card_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.variant_of_card_id IS NULL THEN
    UPDATE public.cards
    SET
      name = NEW.name,
      make = NEW.make,
      model = NEW.model,
      year = NEW.year,
      rarity = NEW.rarity,
      description = NEW.description,
      power_hp = NEW.power_hp,
      power_kw = NEW.power_kw,
      torque_nm = NEW.torque_nm,
      max_speed_kmh = NEW.max_speed_kmh,
      weight_t = NEW.weight_t,
      acceleration_0_100 = NEW.acceleration_0_100,
      engine_size = NEW.engine_size,
      cylinder = NEW.cylinder,
      boost = NEW.boost,
      country_code = NEW.country_code,
      transmission = NEW.transmission,
      new_price_eur = NEW.new_price_eur,
      fuel_type = NEW.fuel_type,
      max_rpm = NEW.max_rpm,
      units_sold = NEW.units_sold
    WHERE variant_of_card_id = NEW.card_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_alternative_art_card_data ON public.cards;

CREATE TRIGGER sync_alternative_art_card_data
AFTER UPDATE OF
  name, make, model, year, rarity, description, power_hp, power_kw, torque_nm,
  max_speed_kmh, weight_t, acceleration_0_100, engine_size, cylinder, boost,
  country_code, transmission, new_price_eur, fuel_type, max_rpm, units_sold
ON public.cards
FOR EACH ROW
EXECUTE FUNCTION public.sync_alternative_art_card_data();
