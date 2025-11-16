Add-Type -AssemblyName System.Drawing
$iconPath = "C:\Users\Lemuel Madriaga\Desktop\New folder (2)\icons"

# Create a simple microphone icon design
function Create-Icon($size, $filename) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.Color]::Transparent)
    
    # Background gradient (purple to blue)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new($size, $size),
        [System.Drawing.Color]::FromArgb(255, 102, 126, 234),
        [System.Drawing.Color]::FromArgb(255, 118, 75, 162)
    )
    $graphics.FillRectangle($brush, 0, 0, $size, $size)
    
    # White microphone icon
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [math]::Max(1, $size / 16))
    $brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    # Microphone body (rounded rectangle)
    $micWidth = $size * 0.3
    $micHeight = $size * 0.4
    $micX = ($size - $micWidth) / 2
    $micY = $size * 0.15
    $graphics.FillRoundedRectangle($brushWhite, $micX, $micY, $micWidth, $micHeight, $size * 0.05)
    
    # Microphone stand
    $standX = $size / 2
    $standY1 = $micY + $micHeight
    $standY2 = $size * 0.8
    $graphics.DrawLine($pen, $standX, $standY1, $standX, $standY2)
    
    # Base
    $baseWidth = $size * 0.4
    $baseX = ($size - $baseWidth) / 2
    $graphics.DrawLine($pen, $baseX, $standY2, $baseX + $baseWidth, $standY2)
    
    $bitmap.Save("$iconPath\$filename", [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $pen.Dispose()
    $brushWhite.Dispose()
}

# Add FillRoundedRectangle method
Add-Type @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
public static class GraphicsExtensions {
    public static void FillRoundedRectangle(this Graphics graphics, Brush brush, float x, float y, float width, float height, float radius) {
        using (GraphicsPath path = new GraphicsPath()) {
            path.AddArc(x, y, radius * 2, radius * 2, 180, 90);
            path.AddArc(x + width - radius * 2, y, radius * 2, radius * 2, 270, 90);
            path.AddArc(x + width - radius * 2, y + height - radius * 2, radius * 2, radius * 2, 0, 90);
            path.AddArc(x, y + height - radius * 2, radius * 2, radius * 2, 90, 90);
            path.CloseAllFigures();
            graphics.FillPath(brush, path);
        }
    }
}
"@

Create-Icon 16 "icon16.png"
Create-Icon 48 "icon48.png"  
Create-Icon 128 "icon128.png"

Write-Host "Icons created successfully!"
