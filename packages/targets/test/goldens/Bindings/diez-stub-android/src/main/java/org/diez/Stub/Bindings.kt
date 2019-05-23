package org.diez.stub

data class Bindings(
    val image: Image = Image(File("assets/image%20with%20spaces.jpg"), File("assets/image%20with%20spaces@2x.jpg"), File("assets/image%20with%20spaces@3x.jpg"), 246, 246),
    val svg: SVG = SVG("assets/image.svg"),
    val lottie: Lottie = Lottie(File("assets/lottie.json"), true, true),
    val fontRegistry: FontRegistry = FontRegistry(arrayOf<File>(File("assets/SomeFont.ttf"))),
    val typograph: Typograph = Typograph("Helvetica", 50F, Color(0.16666666666666666F, 1F, 0.5F, 1F)),
    val haiku: Haiku = Haiku("haiku-component", true, true)
) : StateBag {
    override val name = "Bindings"
}