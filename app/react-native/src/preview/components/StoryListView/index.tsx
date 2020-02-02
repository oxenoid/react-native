// @ts-nocheck
import React, { Component } from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import styled from '@emotion/native';
import Events from '@storybook/core-events';
import addons from '@storybook/addons';
import StoryTreeView from '../StoryTreeView';

const SearchBar = styled.TextInput(
  {
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    fontSize: 16,
    marginHorizontal: 5,
    marginVertical: 5,
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  ({ theme }) => ({
    backgroundColor: theme.borderColor,
    color: theme.buttonActiveTextColor,
  })
);

interface Props {
  stories: any;
}

interface State {
  data: any[];
  originalData: any[];
}

export default class StoryListView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      data: [],
      originalData: [],
    };
  }

  componentDidMount() {
    const channel = addons.getChannel();
    channel.on(Events.STORY_ADDED, this.handleStoryAdded);
    channel.on(Events.SELECT_STORY, this.forceReRender);
    this.handleStoryAdded();
  }

  componentWillUnmount() {
    const channel = addons.getChannel();
    channel.removeListener(Events.STORY_ADDED, this.handleStoryAdded);
    channel.removeListener(Events.SELECT_STORY, this.forceReRender);
  }

  forceReRender = () => {
    this.forceUpdate();
  };

  handleStoryAdded = () => {
    const { stories } = this.props;

    if (stories) {
      const data = Object.values(
        stories
          .raw()
          .reduce((acc: { [kind: string]: { title: string; data: any[] } }, story: any) => {
            acc[story.kind] = {
              title: story.kind,
              data: (acc[story.kind] ? acc[story.kind].data : []).concat(story),
            };

            return acc;
          }, {})
      );

      this.setState({ data, originalData: data });
    }
  };

  handleChangeSearchText = (text: string) => {
    const query = text.trim();
    const { originalData: data } = this.state;

    if (!query) {
      this.setState({ data });
      return;
    }

    const checkValue = (value: string) => value.toLowerCase().includes(query.toLowerCase());
    const filteredData = data.reduce((acc, story) => {
      const hasTitle = checkValue(story.title);
      const hasKind = story.data.some((ref: any) => checkValue(ref.name));

      if (hasTitle || hasKind) {
        acc.push({
          ...story,
          // in case the query matches component's title, all of its stories will be shown
          data: !hasTitle ? story.data.filter((ref: any) => checkValue(ref.name)) : story.data,
        });
      }

      return acc;
    }, []);

    this.setState({ data: filteredData });
  };

  changeStory(kind: string, story: string) {
    const channel = addons.getChannel();
    channel.emit(Events.SET_CURRENT_STORY, { kind, story });
  }

  /* changeStory(storyId: string) {
    const channel = addons.getChannel();
    channel.emit(Events.SET_CURRENT_STORY, { storyId });
  } */

  render() {
    const { stories, selectedKind } = this.props;
    const { storyId } = stories.getSelection();
    const selectedStory = stories.fromId(storyId);
    const { data } = this.state;

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <SearchBar
          testID="Storybook.ListView.SearchBar"
          clearButtonMode="while-editing"
          disableFullscreenUI
          onChangeText={this.handleChangeSearchText}
          placeholder="Filter"
          returnKeyType="search"
        />

        <ScrollView style={{ flex: 1, marginBottom: 40 }}>
          <StoryTreeView
            selectedKind={selectedKind}
            selectedStory={selectedStory}
            ref={ref => {
              this.treeView = ref;
            }}
            data={data}
            onNodePress={({ node, level }) => {
              if (!node.children) {
                this.changeStory(node.kind, node.name);
              }
            }}
            renderNode={({ node, level, isExpanded, hasChildrenNodes }) => (
              <View>
                <Text
                  style={{
                    marginLeft: 25 * level,
                    fontWeight:
                      node.kind === selectedKind && node.name === selectedStory ? 'bold' : 'normal',
                  }}
                >
                  {isExpanded !== null && hasChildrenNodes ? (
                    <Text>{isExpanded ? ' ▼ ' : ' ▶ '}</Text>
                  ) : (
                    <Text> - </Text>
                  )}
                  {node.name}
                </Text>
              </View>
            )}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }
}
