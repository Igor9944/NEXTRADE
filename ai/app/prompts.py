SYSTEM = {
    "fr": (
        "Tu es l'assistant métier NexTrade. Tu expliques la plateforme, les commandes, "
        "documents, logistique et indicateurs. Tu ne modifies aucune donnée, tu n'es pas "
        "une source comptable ou juridique officielle. Tu peux halluciner : invite à vérifier dans l'application."
    ),
    "en": (
        "You are the NexTrade business assistant. You explain the platform, orders, "
        "documents, logistics and simple analytics. You never change data. You are not an official "
        "legal or accounting source."
    ),
    "ar": (
        "أنت مساعد أعمال نيكستريد. تشرح المنصة والطلبات والوثائق واللوجستيات والمؤشرات البسيطة. "
        "لا تعدّل أي بيانات ولست مرجعاً قانونياً أو محاسبياً رسمياً."
    ),
}

MODULE_HELP = {
    "support": {
        "fr": "NexTrade gère clients, fournisseurs, produits, commandes, stock, import/export, expéditions, documents et paiements.",
        "en": "NexTrade covers clients, suppliers, products, orders, stock, import/export, shipments, documents and payments.",
        "ar": "تغطي نيكستريد العملاء والموردين والمنتجات والطلبات والمخزون والاستيراد/التصدير والشحنات والوثائق والمدفوعات.",
    },
    "orders": {
        "fr": "Statuts commande: EN_ATTENTE, PAYEE, EN_PREPARATION, EXPEDIEE, LIVREE, ANNULEE. Le montant vient du serveur.",
        "en": "Order statuses: EN_ATTENTE, PAYEE, EN_PREPARATION, EXPEDIEE, LIVREE, ANNULEE. Amounts come from the server.",
        "ar": "حالات الطلب: EN_ATTENTE، PAYEE، EN_PREPARATION، EXPEDIEE، LIVREE، ANNULEE. المبلغ يأتي من الخادم.",
    },
    "documents": {
        "fr": "Le dossier documentaire contient facture, packing list et formalités douanières liées à une commande.",
        "en": "The document dossier includes invoice, packing list and customs formalities linked to an order.",
        "ar": "يضم الملف الوثائقي الفاتورة وقائمة التعبئة والإجراءات الجمركية المرتبطة بالطلب.",
    },
    "import-export": {
        "fr": "Une opération import/export relie une commande, des pays, un mode de transport et éventuellement une formalité si transfrontalière.",
        "en": "An import/export operation links an order, countries, a transport mode and a formality when cross-border.",
        "ar": "تربط عملية الاستيراد/التصدير طلباً وبلداناً ووسيلة نقل وإجراءً جمركياً عند العبور الحدودي.",
    },
    "shipments": {
        "fr": "Les expéditions suivent PREPARATION → EXPEDIEE → EN_TRANSIT → ARRIVEE → DOUANE → LIVREE.",
        "en": "Shipments follow PREPARATION → EXPEDIEE → EN_TRANSIT → ARRIVEE → DOUANE → LIVREE.",
        "ar": "تتبع الشحنات PREPARATION ثم EXPEDIEE ثم EN_TRANSIT ثم ARRIVEE ثم DOUANE ثم LIVREE.",
    },
    "analytics": {
        "fr": "Le dashboard admin agrège CA, commandes, stock et transactions depuis PostgreSQL. Ce n'est pas une liasse fiscale.",
        "en": "The admin dashboard aggregates revenue, orders, stock and transactions from PostgreSQL. It is not a legal ledger.",
        "ar": "يجمع لوحة تحكم المشرف الإيرادات والطلبات والمخزون والمعاملات من PostgreSQL وليست دفاتر رسمية.",
    },
    "payments": {
        "fr": "Le paiement est initié depuis la commande. Le statut SUCCESS ne vient jamais du frontend.",
        "en": "Payment is initiated from the order. SUCCESS is never decided by the frontend.",
        "ar": "يُبدأ الدفع من الطلب. لا يقرر الواجهة الأمامية حالة SUCCESS.",
    },
}

LIMITS = {
    "fr": "Limites: hallucinations possibles, données incomplètes, latence, pas de décision automatique.",
    "en": "Limits: possible hallucinations, incomplete data, latency, no automated decisions.",
    "ar": "الحدود: احتمال الهلوسة، بيانات غير مكتملة، زمن الاستجابة، لا قرارات آلية.",
}

UNAVAILABLE = {
    "fr": "Information indisponible : cette commande n'est pas dans le contexte fourni. Je n'invente pas de statut ni de montant.",
    "en": "Information unavailable: that order is not in the provided context. I will not invent a status or amount.",
    "ar": "المعلومة غير متاحة: هذا الطلب ليس في السياق المقدّم. لن أخترع حالة أو مبلغاً.",
}

REFUSAL = {
    "fr": "Je ne peux pas accéder à des secrets, modifier une transaction, ni afficher les données privées d'un autre client.",
    "en": "I cannot access secrets, change a transaction, or show another client's private data.",
    "ar": "لا يمكنني الوصول إلى الأسرار أو تعديل معاملة أو عرض بيانات عميل آخر.",
}
