export const Examples = {
  '/': {
    typescript: `import {Color, Typograph} from '@diez/prefabs';
import {Component, property} from '@diez/engine';

class Palette extends Component {
  private lightener = 0.2;

  @property black = Color.rgb(8, 8, 12);
  @property pink500 = Color.rgb(255, 63, 112);
  @property pink400 = this.pink500.lighten(this.lightener);
}

const palette = new Palette();

class Typographs extends Component {
  @property heading1 = new Typograph({
    fontSize: 24,
    fontName: 'SourceCodePro-Regular',
    color: palette.black,
  });
}

export class DesignSystem extends Component {
  @property palette = palette;
  @property typographs = new Typographs();
}`,
    kotlin: `import org.diez.designSystem.*

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val designSystem = DesignSystem()
        view.setBackgroundColor(designSystem.palette.pink500.color)
        textView.typograph = designSystem.typographs.heading1
    }
}`,
    swift: `import DiezDesignSystem

class ViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()

        let designSystem = DesignSystem()
        view.backgroundColor = designSystem.palette.pink500.color
        label.apply(designSystem.typographs.heading1)
    }
}`,
    javascript: `import {DesignSystem} from 'diez-design-system';

class View extends React.PureComponent {
  render () {
    const ds = new DesignSystem();

    return (
      <div style={{backgroundColor: ds.palette.pink500.toString()}}>
        <h1 style={ds.typographs.heading1.css}>
          Hello Diez!
        </h1>
      </div>
    );
  }
}`,
  },
};