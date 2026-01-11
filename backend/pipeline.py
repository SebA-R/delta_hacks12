import json
from call import initiate_outbound_call, DEFAULT_DESTINATION_NUMBER
from retrieve_conversation import get_call_results
from scraper import get_physicians_near_address, write_to_json

DEFAULT_ADDRESS = "1280 Main Street West, Hamilton, Ontario L8S 4L8"
DEFAULT_RADIUS_KM = 30
DEFAULT_OUTPUT_PATH = "../data/hamilton_physicians.json"


def _normalize_phone_number(phone):
    if not phone:
        return None

    stripped = phone.strip()
    if stripped.startswith("+"):
        return stripped

    digits = "".join(ch for ch in stripped if ch.isdigit())
    if len(digits) == 10:
        return f"+1{digits}"
    if len(digits) == 11 and digits.startswith("1"):
        return f"+{digits}"
    return None


def _select_destination_number(physicians):
    for entry in physicians:
        phone = _normalize_phone_number(entry.get("phone"))
        if phone:
            return phone
    return DEFAULT_DESTINATION_NUMBER


def run_pipeline(
    address=DEFAULT_ADDRESS,
    radius_km=DEFAULT_RADIUS_KM,
    output_path=DEFAULT_OUTPUT_PATH,
):
    physicians = get_physicians_near_address(address=address, radius_km=radius_km)
    write_to_json(
        data=physicians,
        address=address,
        radius_km=radius_km,
        filename=output_path,
    )

    destination_number = _select_destination_number(physicians)
    result = initiate_outbound_call(destination_number=destination_number)
    return get_call_results(result.conversation_id)


def load_physicians(path=DEFAULT_OUTPUT_PATH):
    with open(path, "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    return payload.get("physicians", [])


if __name__ == "__main__":
    run_pipeline()
