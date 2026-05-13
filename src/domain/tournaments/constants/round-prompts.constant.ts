import { TournamentRoundPromptType } from '@src/domain/tournaments/enums/tournament-round-prompt-type.enum';

export interface RoundPromptDefinition {
  key: string;
  type: TournamentRoundPromptType.TEXT;
  content: {
    en: string;
    ru: string;
  };
}

export const ROUND_PROMPTS: RoundPromptDefinition[] = [
  {
    key: 'alien_impress',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The best way to impress an alien visiting Earth.',
      ru: 'Лучший способ впечатлить инопланетянина, который прилетел на Землю.',
    },
  },
  {
    key: 'bad_restaurant_waiter',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'You know a restaurant is bad when the waiter says: “____.”',
      ru: 'Ты понимаешь, что ресторан плохой, когда официант говорит: «____».',
    },
  },
  {
    key: 'monopoly_rule',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A new rule for Monopoly: pass Go and collect ____.',
      ru: 'Новое правило для Монополии: проходишь круг и получаешь ____.',
    },
  },
  {
    key: 'rejected_color',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A rejected name for a crayon color.',
      ru: 'Название цвета мелка, которое отвергли на последнем этапе.',
    },
  },
  {
    key: 'magic_bus',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A rejected school bus adventure: The Magic School Bus Goes To ____.',
      ru: 'Забракованное приключение школьного автобуса: «Волшебный автобус едет в ____».',
    },
  },
  {
    key: 'dog_idiot',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A clear sign your dog is not a genius.',
      ru: 'Верный признак, что твоя собака — не гений.',
    },
  },
  {
    key: 'cult_sign',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A suspicious sign that your hobby group might be a cult.',
      ru: 'Подозрительный признак, что твой кружок по интересам может быть сектой.',
    },
  },
  {
    key: 'laser_surgery',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A strange surgery that starts with the word “laser”.',
      ru: 'Странная операция, название которой начинается со слова «лазерная».',
    },
  },
  {
    key: 'baseball_umpire',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A weird thing for a referee to quietly say during a game.',
      ru: 'Странная фраза, которую судья может тихо сказать во время матча.',
    },
  },
  {
    key: 'bagels_rename',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Bagels should really be renamed ____.',
      ru: 'Бейглы давно пора переименовать в ____.',
    },
  },
  {
    key: 'friendly_heckler',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Something a friendly heckler would yell at a comedy show.',
      ru: 'Что крикнул бы доброжелательный хеклер на стендап-шоу.',
    },
  },
  {
    key: 'eiffel_tower_upgrade',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The Eiffel Tower would be cooler if it had ____.',
      ru: 'Эйфелева башня была бы круче, если бы у неё был ____.',
    },
  },
  {
    key: 'prom_embarrassment',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The most embarrassing thing that could happen at prom.',
      ru: 'Самое неловкое, что может случиться на выпускном.',
    },
  },
  {
    key: 'no_bathroom_bar',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The name of a bar with no bathrooms.',
      ru: 'Название бара, в котором нет туалетов.',
    },
  },
  {
    key: 'inside_womb',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The only thing you remember from before you were born.',
      ru: 'Единственное, что ты помнишь ещё до своего рождения.',
    },
  },
  {
    key: 'dumb_science',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The dumbest use of science would be cloning ____.',
      ru: 'Самое глупое применение науки — клонировать ____.',
    },
  },
  {
    key: 'dating_profile_monster',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A line you would see on a monster’s dating profile.',
      ru: 'Строка, которую можно увидеть в анкете монстра на сайте знакомств.',
    },
  },
  {
    key: 'bad_vehicle_race',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The worst vehicle for a street race.',
      ru: 'Худший транспорт для уличной гонки.',
    },
  },
  {
    key: 'mannequin_thoughts',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'What mannequins are probably thinking all day.',
      ru: 'О чём манекены, скорее всего, думают весь день.',
    },
  },
  {
    key: 'never_exclamation',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A word that should never be followed by an exclamation mark.',
      ru: 'Слово, после которого никогда не должен стоять восклицательный знак.',
    },
  },
  {
    key: 'magic_ball_liquid',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'What is that mysterious liquid inside a fortune-telling toy?',
      ru: 'Что за загадочная жидкость внутри игрушки-предсказателя?',
    },
  },
  {
    key: 'football_coach_dump',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'What should be dumped on the losing coach after a game?',
      ru: 'Что нужно вылить на проигравшего тренера после матча?',
    },
  },
  {
    key: 'giving_tree_sequel',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'An odd sequel to a classic children’s book.',
      ru: 'Странное продолжение классической детской книги.',
    },
  },
  {
    key: 'hamster_transport',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Forget hamster wheels. Modern hamsters travel by ____.',
      ru: 'Забудьте про колесо. Современные хомяки передвигаются на ____.',
    },
  },
  {
    key: 'lazy_cowboy_horse',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'What a lazy cowboy would name his horse.',
      ru: 'Как ленивый ковбой назвал бы свою лошадь.',
    },
  },
  {
    key: 'pirate_singles_bar',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The name of a singles bar for pirates.',
      ru: 'Название бара знакомств для пиратов.',
    },
  },
  {
    key: 'pointless_volunteer_work',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The most pointless volunteer work would be helping ____.',
      ru: 'Самая бессмысленная волонтёрская работа — помогать ____.',
    },
  },
  {
    key: 'seduce_bear',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'How do you politely impress a bear?',
      ru: 'Как вежливо произвести впечатление на медведя?',
    },
  },
  {
    key: 'minion_disease',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The name of a disease that makes you look like a cartoon sidekick.',
      ru: 'Название болезни, из-за которой ты выглядишь как мультяшный помощник злодея.',
    },
  },
  {
    key: 'bad_movie_problem',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The biggest problem with the latest space movie.',
      ru: 'Главная проблема последнего космического фильма.',
    },
  },
  {
    key: 'boss_question',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Who is really the boss?',
      ru: 'Кто здесь на самом деле главный?',
    },
  },
  {
    key: 'abandoned_mall',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A good use for an abandoned shopping mall.',
      ru: 'Хорошее применение для заброшенного торгового центра.',
    },
  },
  {
    key: 'bad_nose_job',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A sign you got a suspiciously bad nose job.',
      ru: 'Признак, что тебе сделали подозрительно плохую операцию на носу.',
    },
  },
  {
    key: 'better_elections',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Elections would be better if candidates had to compete in ____.',
      ru: 'Выборы стали бы лучше, если бы кандидаты соревновались в ____.',
    },
  },
  {
    key: 'too_many',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Honestly, you can never have too many ____.',
      ru: 'Честно говоря, ____ никогда не бывает слишком много.',
    },
  },
  {
    key: 'horror_killer_reveal',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'That horror movie was scary until the monster turned out to be ____.',
      ru: 'Этот хоррор был страшным, пока монстр не оказался ____.',
    },
  },
  {
    key: 'antisocial_network',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'What would you call your anti-social network?',
      ru: 'Как бы называлась твоя антисоциальная сеть?',
    },
  },
  {
    key: 'old_curse_word',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'An old-fashioned curse word nobody uses anymore.',
      ru: 'Старомодное ругательство, которым уже никто не пользуется.',
    },
  },
  {
    key: 'marathon_outfit',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The worst thing to wear while running a marathon.',
      ru: 'Худшая одежда для марафона.',
    },
  },
  {
    key: 'fish_tank',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Your fish are bored. Put ____ in their tank.',
      ru: 'Твоим рыбкам скучно. Положи им в аквариум ____.',
    },
  },
  {
    key: 'grandparents_known_as',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'In this house, Grandma and Grandpa are known as ____.',
      ru: 'В этом доме бабушку и дедушку называют ____.',
    },
  },
  {
    key: 'pokemon_job',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: '“Pokémon Trainer” sounds much better than “Pokémon ____.”',
      ru: '«Тренер покемонов» звучит намного лучше, чем «покемон-____».',
    },
  },
  {
    key: 'cave_paintings',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Archaeologists are hiding cave paintings of ____.',
      ru: 'Археологи скрывают наскальные рисунки с изображением ____.',
    },
  },
  {
    key: 'cats_secret',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The secret thing cats do when nobody is looking.',
      ru: 'Тайное занятие котов, когда никто не смотрит.',
    },
  },
  {
    key: 'terrible_farmer',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A good sign you are a terrible farmer.',
      ru: 'Верный признак, что ты ужасный фермер.',
    },
  },
  {
    key: 'toys_came_alive',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'If your childhood toys came to life, they would say: “____.”',
      ru: 'Если бы твои детские игрушки ожили, они бы сказали: «____».',
    },
  },
  {
    key: 'worst_restaurant_hut',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The worst restaurant name: ____ Hut.',
      ru: 'Худшее название ресторана: «____ Hut».',
    },
  },
  {
    key: 'mom_yeet',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'What your mom thinks the word “yeet” means.',
      ru: 'Что, по мнению твоей мамы, означает слово «yeet».',
    },
  },
  {
    key: 'party_sign',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'You know it’s a party when someone shows up with ____.',
      ru: 'Ты понимаешь, что это вечеринка, когда кто-то приходит с ____.',
    },
  },
  {
    key: 'scratch_ticket',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'You know the lottery ticket is bad when the prize is three ____.',
      ru: 'Ты понимаешь, что лотерейный билет плохой, когда приз — это три ____.',
    },
  },
  {
    key: 'kale_use',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A surprising new use for kale.',
      ru: 'Неожиданное новое применение кейла.',
    },
  },
  {
    key: 'trading_cards',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Kids are suddenly obsessed with ____ trading cards.',
      ru: 'Дети внезапно сходят с ума по коллекционным карточкам с ____.',
    },
  },
  {
    key: 'mom_music_festival',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A name for a music festival your mother would approve of.',
      ru: 'Название музыкального фестиваля, который одобрила бы твоя мама.',
    },
  },
  {
    key: 'beats_rock_paper_scissors',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'What beats rock, paper, and scissors?',
      ru: 'Что побеждает камень, ножницы и бумагу?',
    },
  },
  {
    key: 'coffee_size',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Along with small, medium, and large, cafés should add a new size: ____.',
      ru: 'Кроме маленького, среднего и большого, кофейням нужен новый размер: ____.',
    },
  },
  {
    key: 'snake_compliment',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The nicest compliment you can give a snake.',
      ru: 'Самый милый комплимент, который можно сделать змее.',
    },
  },
  {
    key: 'full_moon',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Under a full moon, some people turn into ____.',
      ru: 'В полнолуние некоторые люди превращаются в ____.',
    },
  },
  {
    key: 'president_counts',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'What a president counts at night instead of sheep.',
      ru: 'Что президент считает ночью вместо овец.',
    },
  },
  {
    key: 'milk_slogan',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A rejected slogan for milk.',
      ru: 'Забракованный слоган для молока.',
    },
  },
  {
    key: 'planet_core',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'What is at the core of the planet named after you?',
      ru: 'Что находится в ядре планеты, названной в твою честь?',
    },
  },
  {
    key: 'mediocre_awards',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The name of an award show for the most mediocre movies of the year.',
      ru: 'Название премии для самых посредственных фильмов года.',
    },
  },
  {
    key: 'relationship_rules',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Relationship rule: never go to bed angry and never wake up ____.',
      ru: 'Правило отношений: никогда не ложись спать злым и никогда не просыпайся ____.',
    },
  },
  {
    key: 'wax_statue',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Hard to believe, but the wax museum now has a statue of ____.',
      ru: 'Трудно поверить, но в музее восковых фигур теперь есть статуя ____.',
    },
  },
  {
    key: 'scary_story_end',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The worst words to end a scary story.',
      ru: 'Худшие слова для финала страшной истории.',
    },
  },
  {
    key: 'dumb_question',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The dumbest question to ask on the internet.',
      ru: 'Самый глупый вопрос, который можно задать в интернете.',
    },
  },
  {
    key: 'old_cds',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A good use for all your old CDs.',
      ru: 'Хорошее применение для старых CD-дисков.',
    },
  },
  {
    key: 'breakup_line',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The worst breakup line: “It’s not you, it’s ____.”',
      ru: 'Худшая фраза для расставания: «Дело не в тебе, а в ____».',
    },
  },
  {
    key: 'painting_above_bed',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'It would be terrifying to have a painting of ____ above your bed.',
      ru: 'Было бы жутко повесить над кроватью картину с ____.',
    },
  },
  {
    key: 'nightmare_sign',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A sure sign you are trapped in a horrible nightmare.',
      ru: 'Верный признак, что ты застрял в кошмаре.',
    },
  },
  {
    key: 'future_generation',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The nickname for babies born ten years from now.',
      ru: 'Поколенческое прозвище для детей, которые родятся через десять лет.',
    },
  },
  {
    key: 'never_internet_comment',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A comment that has never been made on the internet.',
      ru: 'Комментарий, который никогда не писали в интернете.',
    },
  },
  {
    key: 'witness_protection',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A terrible new name to receive in witness protection.',
      ru: 'Ужасное новое имя, которое можно получить по программе защиты свидетелей.',
    },
  },
  {
    key: 'least_popular_toy',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'This year’s least popular kids’ toy is: “The ____.”',
      ru: 'Самая непопулярная детская игрушка года: «____».',
    },
  },
  {
    key: 'date_slob',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'You know your date is messy when you find ____ in their living room.',
      ru: 'Ты понимаешь, что человек неряха, когда находишь у него в гостиной ____.',
    },
  },
  {
    key: 'eighth_dwarf',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The name of Snow White’s forgotten eighth dwarf.',
      ru: 'Имя забытого восьмого гнома Белоснежки.',
    },
  },
  {
    key: 'haste_makes',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Haste makes ____.',
      ru: 'Поспешишь — ____.',
    },
  },
  {
    key: 'cookie_monster_secret',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'What Cookie Monster snacks on when nobody is looking.',
      ru: 'Чем Коржик перекусывает, когда никто не смотрит.',
    },
  },
  {
    key: 'friends_better_name',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A better name for the TV show Friends.',
      ru: 'Лучшее название для сериала «Друзья».',
    },
  },
  {
    key: 'comic_con_outfit',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A great way to stand out at comic conventions is to dress like ____.',
      ru: 'Лучший способ выделиться на комик-коне — одеться как ____.',
    },
  },
  {
    key: 'campfire_tale',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'In the lamest campfire story, the couple is scared by ____.',
      ru: 'В самой слабой страшилке у костра парочку пугает ____.',
    },
  },
  {
    key: 'still_life',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Still-life paintings would be better if they showed bowls of ____.',
      ru: 'Натюрморты стали бы интереснее, если бы на них были миски с ____.',
    },
  },
  {
    key: 'worst_welcome_mat',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The worst thing to print on a welcome mat.',
      ru: 'Худшая надпись для коврика у входной двери.',
    },
  },
  {
    key: 'one_star_hotel',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'One-star hotel review: “Terrible mattress, no towels, and ____.”',
      ru: 'Отзыв на отель в одну звезду: «Ужасный матрас, нет полотенец и ____».',
    },
  },
  {
    key: 'mom_gang',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The best name for a mom gang.',
      ru: 'Лучшее название для банды мам.',
    },
  },
  {
    key: 'blackjack_yell',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Casinos hate it when you yell “____!” at the blackjack table.',
      ru: 'Казино ненавидят, когда за столом для блэкджека кричат: «____!»',
    },
  },
  {
    key: 'sport_on_skates',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A great sport that never caught on: ____ on ice skates.',
      ru: 'Великий спорт, который почему-то не прижился: ____ на коньках.',
    },
  },
  {
    key: 'mayonnaise',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The one thing you should never put mayonnaise on.',
      ru: 'Единственная вещь, на которую нельзя мазать майонез.',
    },
  },
  {
    key: 'dress_pattern',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The worst pattern for a dress print.',
      ru: 'Худший узор для платья.',
    },
  },
  {
    key: 'meek_inherit',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The meek shall inherit ____.',
      ru: 'Кроткие унаследуют ____.',
    },
  },
  {
    key: 'bad_scrapbook',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A scrapbook nobody wants to see would be devoted to ____.',
      ru: 'Фотоальбом, который никто не хочет видеть, был бы посвящён ____.',
    },
  },
  {
    key: 'bad_confetti',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The worst thing to use as confetti.',
      ru: 'Худшая вещь, которую можно использовать как конфетти.',
    },
  },
  {
    key: 'cactus_defense',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Instead of spikes, a cactus protects itself with ____.',
      ru: 'Вместо колючек этот кактус защищается с помощью ____.',
    },
  },
  {
    key: 'self_driving_car',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A terrible model name for a self-driving car.',
      ru: 'Ужасное название модели для беспилотного автомобиля.',
    },
  },
  {
    key: 'science_stop',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Dear Science, stop already. We know enough about ____.',
      ru: 'Дорогая наука, остановись. Мы уже достаточно знаем о ____.',
    },
  },
  {
    key: 'rideshare_name',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The best name for a rideshare company trying to stand out.',
      ru: 'Лучшее название для сервиса такси, который хочет выделиться.',
    },
  },
  {
    key: 'potluck_dish',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The dish that gets you uninvited from future potlucks.',
      ru: 'Блюдо, после которого тебя больше не зовут на общие ужины.',
    },
  },
  {
    key: 'mom_not_mad',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'You know it’s bad when your mom says, “I’m not mad, I’m ____.”',
      ru: 'Ты понимаешь, что всё плохо, когда мама говорит: «Я не злюсь, я ____».',
    },
  },
  {
    key: 'library_pickup',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A pickup line you might say at the library.',
      ru: 'Фраза для знакомства, которую можно сказать в библиотеке.',
    },
  },
  {
    key: 'weird_bouquet',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'It is a bold choice to send someone a bouquet of ____.',
      ru: 'Смелый ход — отправить кому-то букет из ____.',
    },
  },
  {
    key: 'dressing_room_yell',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The worst thing to yell from a clothing store fitting room.',
      ru: 'Худшее, что можно крикнуть из примерочной в магазине одежды.',
    },
  },
  {
    key: 'anti_valentine',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A new holiday for people who hate Valentine’s Day.',
      ru: 'Новый праздник для людей, которые ненавидят День святого Валентина.',
    },
  },
  {
    key: 'scheduling_app',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The name of a scheduling app nobody downloads.',
      ru: 'Название приложения для записи на встречи, которое никто не скачивает.',
    },
  },
  {
    key: 'grandma_cash',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Family secret: Grandma keeps her cash in ____.',
      ru: 'Семейная тайна: бабушка хранит деньги в ____.',
    },
  },
  {
    key: 'philosopher_sitcom',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'A name for a sitcom about ancient philosophers.',
      ru: 'Название ситкома про древних философов.',
    },
  },
  {
    key: 'tamest_action_movie',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The name of the tamest action movie ever made.',
      ru: 'Название самого спокойного боевика в истории.',
    },
  },
  {
    key: 'fool_me_twice',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'Fool me once, shame on you. Fool me twice, ____.',
      ru: 'Обманул меня один раз — стыдно тебе. Обманул дважды — ____.',
    },
  },
  {
    key: 'gamer_utopia',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The best name for a gamers-only utopia.',
      ru: 'Лучшее название для утопии только для геймеров.',
    },
  },
  {
    key: 'video_game_simulator',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The weirdest video game: ____ Simulator.',
      ru: 'Самая странная видеоигра: «Симулятор ____».',
    },
  },
  {
    key: 'pixar_movie',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The next animated movie will be about a talking ____.',
      ru: 'Следующий мультфильм будет про говорящий ____.',
    },
  },
  {
    key: 'substitute_teacher',
    type: TournamentRoundPromptType.TEXT,
    content: {
      en: 'The name of a substitute teacher no student would mess with.',
      ru: 'Имя учителя на замене, с которым никто не стал бы спорить.',
    },
  },
];

export const MAX_TOURNAMENT_ROUNDS = 4;
