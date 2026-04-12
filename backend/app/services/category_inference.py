"""
Infers transaction categories from merchant names and descriptions.
Nessie purchases have no category field, so we keyword-match on description.
"""

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "Clothing": [
        "zara", "h&m", "hm", "asos", "nike", "adidas", "uniqlo", "gap", "shein",
        "urban outfitters", "nordstrom", "forever 21", "old navy", "foot locker",
        "levi", "patagonia", "puma", "reebok", "vans", "supreme", "macy", "tj maxx",
        "ross", "banana republic", "j.crew", "express", "abercrombie", "hollister",
        "american eagle", "victoria secret", "calvin klein", "ralph lauren",
    ],
    "Dining": [
        "chipotle", "starbucks", "mcdonald", "sweetgreen", "trader joe",
        "whole foods", "subway", "dunkin", "panera", "shake shack",
        "chick-fil-a", "taco bell", "burger king", "wendy", "pizza", "domino",
        "doordash", "uber eats", "grubhub", "postmates", "instacart",
        "chili", "olive garden", "applebee", "ihop", "denny", "five guys",
        "panda express", "in-n-out", "raising cane", "wingstop",
        "restaurant", "cafe", "diner", "bistro", "grill", "kitchen", "eatery",
    ],
    "Entertainment": [
        "amc", "regal", "cinemark", "ticketmaster", "stubhub", "eventbrite",
        "steam", "playstation", "xbox", "nintendo", "twitch", "youtube premium",
        "disney+", "hbo", "paramount", "peacock", "apple tv",
        "concert", "theatre", "museum", "bowling", "arcade", "escape room",
        "golf", "laser tag", "Dave & buster",
    ],
    "Subscriptions": [
        "spotify", "netflix", "hulu", "amazon prime", "apple music",
        "google one", "dropbox", "adobe", "microsoft 365", "notion",
        "gym", "planet fitness", "equinox", "peloton",
        "subscription", "monthly", "annual plan",
    ],
    "Transport": [
        "uber", "lyft", "metro", "mta", "bart", "cta", "transit",
        "amtrak", "greyhound", "delta", "united", "american airlines",
        "southwest", "jetblue", "spirit", "frontier",
        "shell", "exxon", "chevron", "bp", "mobil", "sunoco",
        "parking", "toll", "zipcar", "enterprise", "hertz",
    ],
    "Health": [
        "cvs", "walgreens", "rite aid", "duane reade", "pharmacy",
        "hospital", "clinic", "urgent care", "doctor", "dental",
        "vision", "optical", "therapy", "counseling",
    ],
    "Shopping": [
        "amazon", "target", "walmart", "costco", "ikea", "home depot",
        "lowe", "best buy", "apple store", "samsung", "staples", "office depot",
        "bed bath", "crate & barrel", "pottery barn", "wayfair", "chewy",
        "petco", "petsmart",
    ],
}


def infer_category(description: str) -> str:
    """Returns the best matching category for a merchant name/description."""
    desc_lower = description.lower()

    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in desc_lower:
                return category

    return "Other"
