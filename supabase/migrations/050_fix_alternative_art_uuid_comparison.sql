-- Fix PostgreSQL's "operator does not exist: text = uuid" when editing a vehicle
-- in Card Studio. cards.variant_of_card_id is TEXT, while cards.card_id is UUID.
-- Cast the UUID rather than the indexed TEXT column to preserve index usage.

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
    WHERE variant_of_card_id = NEW.card_id::text;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_alternative_art_competition_type()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.variant_of_card_id IS NULL THEN
    UPDATE public.cards
    SET
      competition_type = NEW.competition_type,
      competition_type_custom = NEW.competition_type_custom,
      is_record = NEW.is_record,
      record_description = NEW.record_description
    WHERE variant_of_card_id = NEW.card_id::text;
  END IF;

  RETURN NEW;
END;
$$;
