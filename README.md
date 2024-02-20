# DyBot
Commissioned Discord Bot for Dyron

> /profile create - User can create a profile which can be accessed by 
issuing commands through a specific Discord ID.
> - Users will be prompted whether they want their 
username to be shown on a leaderboard.
> - Upon confirming, the "User" data will be stored 
containing the following information. This data will be 
accessed whenever the user uses a command.
>   - "user_id": Discord ID
>   - "user_coupons": list of coupons of different types and 
quantities (e.g. Large 5% (x1), Medium 10% (x2))
>   - "balance": frequency of internal money
>   - "alias/name": Discord username/tag
Profile /profile view - User can view their database information (Name, DyDots, Coupons)
>   - User can view their coupons in a separate embed 
which will act as an item inventory.

> /leaderboard view - User can see a leaderboard listing the top 10 user tags
along with their amount of currency
> - User can see which place on the leaderboard they are 
"You are on place (xy)".
Leaderboard /leaderboard 
visible: yes/no
> - Can be used to opt in/out of the leaderboard.

> /coupons view - User can view a list of coupons and their respective 
prices
> - User can also see what their current balance is

> Coupons /coupons buy (option)
> - User can buy a Coupon 
> - They must specify a type of coupon (small, medium, 
large), as well as which discount they want (5%, 10%, 
20%).

> Emotes /emotes order 
> - User can order an emote of a certain type 
(Sketch/Lineart/Color with Black Lineart/Color with 
Colored Lineart/Animated) and frequency.
> - They will be asked to confirm their choice before 
proceeding.
> - The admin will be notified via DM of an order and the 
user will be sent a confirmation.
> - Order status is changeable

> /emotes order view
> - User can look at current and past orders with states
> - States are: Order recieved/Order started or in work 
(meaning that a contract has been signed)/Order 
Complete (and maybe "Order cancelled?)
> - Orders in the "Order recieved"state can be cancelled 
by the user

> Emotes /emotes options - User can see a list of all Emote-Types with name, 
picture, base price
Emotes /emotes price (option)
> - User can view a price of a specific option: 
>   - Sketch/Lineart/Color with Black Lineart/Color with 
>   - Colored Lineart/Animated

> /help 
> - User can view general information about how the bot functions.

> /help commandName
> - gives a description of what a command does

> /vote - User can vote on top.gg and will give 1 Dy-Dot
> - Doing multiple votes within a certain time frame will 
build up a streak, increasing the number of internal 
currency depending on tier 
