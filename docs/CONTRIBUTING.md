# Contributing

## Code

If you have a cool idea for a feature you want to add to the game, feel free to create a pull request and update the code as to implement said feature. If the feature fits with the game and works properly, I'll merge it.

## Hats

There is an easy API to add new hats to the game - open a pull request and follow the instructions below:

### Create an Image For Your Custom Hat

This image can be anything you choose. Generally, it will display better if its width is equal to its height. Make sure the image is in `.png` format.

### Create Your Hat

Go to `main.js`, and find the `preload` function. Here, you can create your hat. To start, modify the `hats` object by loading in your custom hat image (inside the preload function):

```js
hats.myHat = loadImage("myHat.png")
```

Then, set the "source file" of your hat. This is the image that is displayed in the hat selection menu. You can just make the same image as the one you used in the last step - unless you want some sort of special display in the selection menu.

```js
hats.myHat.sourceFile = "myHat.png";
```

Then, you can adjust how the hat displays itself:

```js
hats.myHat.xOffset = -30; // how much the hat is x offset by
hats.myHat.yOffset = -30; // how much the hat is y offset by
hats.myHat.customWidth = 60; // the width of the hat when it displays - default 60
hats.myHat.customHeight = 60; // the height of the hat when it displays - default 60
```

At this point, your hat is done. If you add `"myHat"` to `localProxy.unlockedHats`, you can select and display it.

### Achievements

However, at the moment, your hat isn't unlockable via achievement. In order to make it so, you need to modify/add the `hatsUnlocked` attribute of an achievement. For example:

```js
const strangerDanger = { title: "Stranger Danger", desc: "Win a multiplayer duel.", hatsUnlocked: ["myHat"] };
```

An achievement can unlock multiple hats.

### Hat Display

Finally, your hat needs a *display name* - how it displays when unlocked.

You can modify the `displayHats`object as so:

```js
const displayHats = {
    "sunglasses": "Sunglasses",
    "cake": "Cake Hat",
    "voidhat": "Void Hat",
    "axe": "Axe Hat",
    "cap": "Baseball Cap",
    "head": "Second Head",
    "ball": "Bowling Ball",
    "hamilton": "Hamilton Head",
    "ben": "Ben Franklin Head",
    "techno": "Technoblade Head",
    "myHat": "My Hat" // add this line
}
```

And that's it! Now, your custom hat is completely working!

Create a pull request, and if I like your hat idea, I'll merge it into the game!