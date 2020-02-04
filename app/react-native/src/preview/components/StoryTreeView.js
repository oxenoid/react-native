import TreeView from 'react-native-final-tree-view';

class StoryTreeView extends TreeView {
  getInitialState = () => ({
    selectedKind: this.props.selectedKind,
    selectedStory: this.props.selectedStory,
    isFirstRun: true,
  });

  componentWillReceiveProps(props) {
    if (
      props.selectedKind != null &&
      props.selectedStory != null &&
      this.state.isFirstRun === true
    ) {
      const fullPath = `${props.selectedKind}/${props.selectedStory}`.split('/');
      let path = '';
      fullPath.forEach(s => {
        path = path + (path !== '' ? '/' : '') + s;
        this.toggleCollapse(path);
      });
      this.setState({ isFirstRun: false });
    }
  }
}

export default StoryTreeView;
