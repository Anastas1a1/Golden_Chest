import json
from channels.generic.websocket import AsyncWebsocketConsumer
from game.models import Player, Box
import random
import string
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from django.db.models import Count, Max


class StartConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()

    async def receive(self, text_data):
        try:
            if text_data:
                text_data_json = json.loads(text_data)
                message = text_data_json['message']
                if message == 'start_game':
                    print(message)
                    try:
                        new_game, game_id = await self.check_unique_game_id()
                    except:
                        print('new_game: ошибка подключения к дб')
                        new_game, game_id = True, 1
                    second_player = True
                    if new_game:
                        second_player = False
                        await self.create_field(game_id)

                    token = ''.join(random.choices(
                        string.ascii_letters + string.digits, k=8))
                    try:
                        await self.create_player(game_id, token)
                    except:
                        print('Создание пользователя неуспешно')    
                    

                    await self.send(text_data=json.dumps({
                        'success': True,
                        'token': token,
                        'game_id': game_id,
                        'second_player': second_player
                    }))
                    await self.close()
            else:
                print("No data received")

        except json.JSONDecodeError as e:
            print(f"Error decoding json: {e}")
            await self.close()

        except KeyError as e:
            print(f"Missing key in json data: {e}")
            await self.close()

    @database_sync_to_async
    def check_unique_game_id(self):
        game_id_counts = Player.objects.values(
            'game_id').annotate(count=Count('game_id'))
        unique_game_ids = [game_id['game_id'] for game_id in game_id_counts if game_id['count'] == 1]
        if unique_game_ids:
            return False, unique_game_ids[0]
        else:
            max_game_id = Player.objects.aggregate(
                max_game_id=Max('game_id'))['max_game_id']
            if max_game_id:
                return True, max_game_id+1
            else:
                return True, 1

    @database_sync_to_async
    def create_player(self, game_id, token):
        Player.objects.create(game_id=game_id, name=token)

    @database_sync_to_async
    def create_field(self, game_id):
        for number in range(15):
            value = random.randint(0, 10)
            print(number, ' -- ', value)
            Box.objects.create(game_id=game_id, number=number, value=value)
        Box.objects.create(game_id=game_id, number=15, value=0, is_open=True)


class GameConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        if 'game_id' in self.scope['url_route']['kwargs']:
            self.game_id = self.scope['url_route']['kwargs']['game_id']
            self.token = self.scope['query_string'].decode("utf-8")

            await self.channel_layer.group_add(
                self.game_id,
                self.channel_name
            )
        await self.accept()

    async def disconnect(self, close_code):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.token = self.scope['query_string'].decode(
            "utf-8").replace('token=', '')

        await self.channel_layer.group_discard(
            self.game_id,
            self.channel_name
        )

        print(close_code)
        await self.game_over_check()
        

    async def receive(self, text_data):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.token = self.scope['query_string'].decode(
            "utf-8").replace('token=', '')
        print(self.token)
        text_data_json = json.loads(text_data)
        print(text_data_json)
        box_number = text_data_json['box_number']

        if box_number == 'game_over' or box_number == 14:
            await self.game_over_check()

        else:
            try:
                box = await self.get_box(box_number)

            except Box.DoesNotExist:
                return

            if box.is_open:
                players = await self.get_players()
                for player in players:
                    if player.name != self.token:
                        turn = player.name

                await self.channel_layer.group_send(
                    self.game_id, {
                        'type': 'game_message',
                        'turn': turn,
                        'boxNumber': box_number,
                    })
                
            else:
                box.is_open = True
                await database_sync_to_async(box.save)()
                players = await self.get_players()
                for player in players:
                    if player.name == self.token:
                        print('box.value ----  ', box.value)
                        if box.value == 0:
                            player.current_score = 0
                            await database_sync_to_async(player.save)()
                        player.current_score += box.value
                        await database_sync_to_async(player.save)()

                        await self.send(text_data=json.dumps({
                            'success': True,
                            'boxNumber': box_number,
                            'value': box.value,
                            'score': player.current_score
                        }))


 



    async def game_over_check(self):
        turn = 0
        currentScore = 0
        opponentScore = 0
        players = await self.get_players()
        if len(players) == 1:
            turn = players[0].name
            currentScore = players[0].current_score
            opponentScore = 0
        else:
            for player in players:
                if player.name == self.token:
                    turn = player.name
                    currentScore = player.current_score
                else:
                    opponentScore = player.current_score

        await self.channel_layer.group_send(
            self.game_id,{
                'type': 'game_over_message',
                'turn': turn,
                'currentScore': currentScore,
                'opponentScore': opponentScore
            })
        await self.delete_box()
        await self.delete_player()

    async def game_over_message(self, event):
        currentScore = event['currentScore']
        opponentScore = event['opponentScore']
        turn = event['turn']
        await self.send(text_data=json.dumps({
            'groupGameOverSuccess': True,
            'turn': turn,
            'currentScore': currentScore,
            'opponentScore': opponentScore
        }))

    async def game_message(self, event):
        box_number = event['boxNumber']
        turn = event['turn']
        await self.send(text_data=json.dumps({
            'groupSuccess': True,
            'turn': turn,
            'boxNumber': box_number,
        }))

    @database_sync_to_async
    def get_box(self, box_number):
        return Box.objects.get(number=box_number, game_id=self.game_id)

    @database_sync_to_async
    def get_players(self):
        return list(Player.objects.filter(game_id=self.game_id))

    @database_sync_to_async
    def delete_box(self):
        Box.objects.filter(game_id=self.game_id).delete()

    @database_sync_to_async
    def delete_player(self):
        Player.objects.filter(game_id=self.game_id).delete()
