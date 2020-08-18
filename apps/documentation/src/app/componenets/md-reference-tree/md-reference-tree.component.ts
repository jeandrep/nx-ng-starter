import { NestedTreeControl } from '@angular/cdk/tree';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { DOC_APP_ENV, IDocAppEnvironment } from '../../interfaces/environment.interface';
import { mdFilesActions } from '../../modules/store/md-files/md-files.store';
import { Store } from '@ngxs/store';

/**
 * Nodes data with nested structure.
 * Each node has a name and an optional list of children.
 */
interface IMarkdownReferenceNode {
  name: string;
  filePath?: string;
  children?: IMarkdownReferenceNode[];
}

@Component({
  selector: 'documentation-md-reference-tree',
  templateUrl: './md-reference-tree.component.html',
  styleUrls: ['./md-reference-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDocMarkdownReferenceTreeComponent {
  public readonly treeControl = new NestedTreeControl<IMarkdownReferenceNode>(
    node => node.children,
  );

  public readonly dataSource = new MatTreeNestedDataSource<IMarkdownReferenceNode>();

  private readonly treeData = () => {
    const mdFilePaths = [
      '/README.md', // root readme in not present in autogenerated array and should be added here
      ...this.env.mdFilePaths,
    ];
    const basePath = 'md/';
    const treeNodes = mdFilePaths.map(item => {
      const name = item.replace(/\/[A-Za-z]+\.md/, '/');
      const filePath = `${basePath}${item}`;
      const children: IMarkdownReferenceNode[] = [
        { name: item.replace(/^.*\/(?=[A-Za-z]+\.md$)/, ''), filePath },
      ];
      return { name, children } as IMarkdownReferenceNode;
    });
    this.store.dispatch(new mdFilesActions.setState({ mdFilePaths }));
    return treeNodes;
  };

  constructor(
    private readonly store: Store,
    @Inject(DOC_APP_ENV) private readonly env: IDocAppEnvironment,
  ) {
    this.dataSource.data = this.treeData();
  }

  public readonly hasChild = (index: number, node: IMarkdownReferenceNode) =>
    typeof node.children !== 'undefined' && node.children.length > 0;

  public showReadme(filePath: string): void {
    this.store.dispatch(new mdFilesActions.setState({ filePath }));
  }
}
