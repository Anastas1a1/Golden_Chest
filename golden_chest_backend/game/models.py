from django.db import models
# from django.apps import apps

# apps.ready()


class Box(models.Model):
    game_id = models.IntegerField(default=0)
    number = models.IntegerField(default=0)
    value = models.IntegerField(default=0)
    is_open = models.BooleanField(default=False)

class Player(models.Model):
    name = models.CharField(max_length=100)
    game_id = models.IntegerField(default=0)
    current_score = models.IntegerField(default=0)
    