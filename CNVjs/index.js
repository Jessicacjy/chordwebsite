//index.js
<!DOCTYPE html>
<meta charset="utf-8">
<script type = "text/javascript" src= "//stardustjs.github.io/stardust/v0.1.1/stardust.bundle.min.js"><
<script type="text/javascript" src="//stardustjs.github.io/stardust/v0.1.1/stardust.bundle.min.js">

<canvas id="main-canvas"></canvas>

<script type="text/javascript">
    // Get our canvas element
    var canvas = document.getElementById("main-canvas");
    var width = 960;
    var height = 500;

    // Create a WebGL 2D platform on the canvas:
    var platform = Stardust.platform("webgl-2d", canvas, width, height);

    // ... Load data and render your visualization
</script>