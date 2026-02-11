class BigDbRouter:
    """
    Route reads for bigapi models to the 'big' database.
    Block writes/migrations for big DB models.
    """

    app_label = "bigapi"

    def db_for_read(self, model, **hints):
        if model._meta.app_label == self.app_label:
            return "big"
        return None

    def db_for_write(self, model, **hints):
        if model._meta.app_label == self.app_label:
            return None  # prevent writes
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == self.app_label:
            return False  # never migrate bigapi models
        return None