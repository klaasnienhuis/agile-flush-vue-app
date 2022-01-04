import { createStore } from "vuex";
import * as Ably from "ably";
import { generateSessionId } from "../util/sessionIdGenerator.js";

export const store = createStore({
  state: {
    ablyRealtimeInstance: null,
    isAblyConnected: false,
    ablyClientId: null,
    sessionId: null,
    participantsJoinedArr: [],
    channelNames: {
      voting: "voting",
    },
    channelInstances: {
      voting: null,
    },
    showResults: false,
    cards: [
      {
        number: "0",
        count: [],
        visual: ` .----------------.
| .--------------. |
| |     ____     | |
| |   .'    '.   | |
| |  |  .--.  |  | |
| |  | |    | |  | |
| |  |  '--'  |  | |
| |   '.____.'   | |
| |              | |
| '--------------' |
 '----------------'`,
      },
      {
        number: "0.5",
        count: [],
        visual: ` .----------------.
| .--------------. |
| | __           | |
| |/  |   / ___  | |
| |\`| |  / / _ \`.| |
| | | | / |_/_) || |
| | |_|/   .'__.'| |
| |   /   / /___ | |
| |       |_____|| |
| '--------------' |
 '----------------'`,
      },
      {
        number: "1",
        count: [],
        visual: ` .----------------.
| .--------------. |
| |     __       | |
| |    /  |      | |
| |    '| |      | |
| |     | |      | |
| |    _| |_     | |
| |   |_____|    | |
| |              | |
| '--------------' |
 '----------------'`,
      },
      {
        number: "2",
        count: [],
        visual: ` .----------------.
| .--------------. |
| |    _____     | |
| |   / ___ '.   | |
| |  |_/___) |   | |
| |   .'____.'   | |
| |  / /____     | |
| |  |_______|   | |
| |              | |
| '--------------' |
 '----------------'`,
      },
      {
        number: "3",
        count: [],
        visual: ` .----------------.
| .--------------. |
| |    ______    | |
| |   / ____ '.  | |
| |   ''  __) |  | |
| |   _  |__ '.  | |
| |  | |____) |  | |
| |   \\______.'  | |
| |              | |
| '--------------' |
 '----------------'`,
      },
      {
        number: "5",
        count: [],
        visual: ` .----------------.
| .--------------. |
| |   _______    | |
| |  |  _____|   | |
| |  | |____     | |
| |  '_.____''.  | |
| |  | \\____) |  | |
| |   \\______.'  | |
| |              | |
| '--------------' |
 '----------------'`,
      },
      {
        number: "8",
        count: [],
        visual: ` .----------------.
| .--------------. |
| |     ____     | |
| |   .' __ '.   | |
| |   | (__) |   | |
| |   .'____'.   | |
| |  | (____) |  | |
| |  '.______.'  | |
| |              | |
| '--------------' |
 '----------------'`,
      },
      {
        number: "13",
        count: [],
        visual: ` .--------------------------.
| .------------------------. |
| |     __      ______     | |
| |    /  |    / ____ '.   | |
| |    '| |    ''  __) |   | |
| |     | |    _  |__ '.   | |
| |    _| |_  | |____) |   | |
| |   |_____|  \\______.'   | |
| |                        | |
| '------------------------' |
 '--------------------------'`,
      },
      {
        number: "21",
        count: [],
        visual: ` .--------------------------.
| .------------------------. |
| |     _____      __      | |
| |    / ___ '.   /  |     | |
| |   |_/___) |   '| |     | |
| |    .'____.'    | |     | |
| |   / /____     _| |_    | |
| |   |_______|  |_____|   | |
| |                        | |
| '------------------------' |
 '--------------------------'`,
      },
    ],
  },
  getters: {
    isAblyConnected: (state) => state.isAblyConnected,
    clientId: (state) => state.ablyClientId,
    sessionId: (state) => state.sessionId,
    hasSessionStarted: (state) =>
      state.sessionId !== null && state.sessionId !== undefined,
    numberOfParticipantsJoined: (state) => state.participantsJoinedArr.length,
    haveParticipantsJoined: (state) => state.participantsJoinedArr.length > 1,
    showResults: (state) => state.showResults,
    cards: (state) => state.cards,
    cardIndex: (state) => (cardNumber) => {
      return state.cards.findIndex((card) => card.number === cardNumber);
    },
    voteCountForCard: (state) => (cardNumber) => {
      return state.cards.filter((card) => card.number === cardNumber)[0].count
        .length;
    },
    isCardSelectedByClient: (state) => (cardNumber) => {
      let clientIds = state.cards.filter(card => card.number === cardNumber)[0].count;
      if (clientIds.length > 0) {
        return clientIds.includes(state.ablyClientId);
      } else {
        return false;
      }
    },
    isAnyCardSelectedByClient: (state) => {
      let cardCount = state.cards.filter(
        card => card.count.length > 0 && card.count.includes(state.ablyClientId)
      ).length;
      return cardCount > 0;
    },
    selectedCardForClient: (state) => (clientId) => {
      let selectedByClient = state.cards.filter(card =>
        card.count.length > 0 &&
        card.count.includes(clientId))[0];
      if (selectedByClient !== undefined) {
        return selectedByClient.number;
      }
      return null;
    },
    numberOfParticipantsVoted: (state) => {
      let concatenatedCount = [];
      state.cards.forEach(card => {
        concatenatedCount.push(...card.count);
      });
      return concatenatedCount.length;
    }
  },
  mutations: {
    setAblyRealtimeInstance(state, ablyRealtimeInstance) {
      state.ablyRealtimeInstance = ablyRealtimeInstance;
    },
    setAblyConnectionStatus(state, status) {
      state.isAblyConnected = status;
    },
    setAblyClientId(state, clientId) {
      state.ablyClientId = clientId;
    },
    setSessionId(state, sessionId) {
      state.sessionId = sessionId;
    },
    setAblyChannelInstances(state, { voting }) {
      state.channelInstances.voting = voting;
    },
    addParticipantJoined(state, clientId) {
      if (!state.participantsJoinedArr.includes(clientId)) {
        state.participantsJoinedArr.push(clientId);
      }
    },
    removeParticipantJoined(state, clientId) {
      state.participantsJoinedArr.splice(
        state.participantsJoinedArr.findIndex(
          (participant) => participant.id === clientId
        ),
        1
      );
    },
    addParticipantVoted(state, clientVote) {
      console.log("addParticipantVoted", clientVote);
      let index = this.getters.cardIndex(clientVote.cardNumber);
      if (!state.cards[index].count.includes(clientVote.clientId)) {
        state.cards[index].count.push(clientVote.clientId);
      }
    },

    removeParticipantVoted(state, clientVote) {
      console.log("removeParticipantVoted", clientVote);
      let index = this.getters.cardIndex(clientVote.cardNumber);
      if (state.cards[index].count.includes(clientVote.clientId)) {
        state.cards[index].count.splice(
          state.cards[index].count.findIndex(
            id => id === clientVote.clientId
          ),
          1
        );
      }
    },
    toggleShowResults(state) {
      state.showResults = !state.showResults;
    },
    setShowResults(state, showResults) {
      state.showResults = showResults;
    },
    resetCards(state) {
      state.cards.forEach(card => {
        card.count = [];
      });
    },
  },

  actions: {
    instantiateAblyConnection(vueContext, ids) {
      if (!this.getters.isAblyConnected) {
        const ablyInstance = new Ably.Realtime({
          authUrl: "/api/createTokenRequest",
          echoMessages: false,
        });
        ablyInstance.connection.on("connected", () => {
          vueContext.commit("setAblyConnectionStatus", true);
          vueContext.commit("setAblyRealtimeInstance", ablyInstance);
          vueContext.commit(
            "setAblyClientId",
            ids.clientId ?? this.state.ablyRealtimeInstance.auth.clientId
          );
          if (ids.sessionId) {
            vueContext.commit("setSessionId", ids.sessionId);
          }
          vueContext.dispatch("attachToAblyChannels").then(() => {
            vueContext.dispatch("enterClientInAblyPresenceSet");
            vueContext.dispatch("getExistingAblyPresenceSet").then(()=> {
              vueContext.dispatch("subscribeToAblyPresence");
            });
          });
        });
        ablyInstance.connection.on("disconnected", () => {
          vueContext.commit("setAblyConnectionStatus", false);
        });
      }
    },

    async attachToAblyChannels(vueContext) {
      const channelName = `${this.state.channelNames.voting}-${this.state.sessionId}`;
      console.log("channelName", channelName);
      const votingChannel = await this.state.ablyRealtimeInstance.channels.get(
        channelName,
        {
          params: { rewind: "2m" },
        }
      );
      vueContext.commit("setAblyChannelInstances", {
        voting: votingChannel,
      });
      vueContext.dispatch("subscribeToAblyVoting");
    },

    enterClientInAblyPresenceSet() {
      this.state.channelInstances.voting.presence.enter({
        id: this.state.ablyClientId,
      });
    },

    async getExistingAblyPresenceSet(vueContext) {
      await this.state.channelInstances.voting.presence.get((err, participants) => {
        if (!err) {
          console.log("getExistingAblyPresenceSet", participants);
          for (let i = 0; i < participants.length; i++) {
            vueContext.commit("addParticipantJoined", participants[i].clientId);
          }
        } else {
          console.log(err);
        }
      });
    },

    subscribeToAblyPresence(vueContext) {
      this.state.channelInstances.voting.presence.subscribe("enter", (msg) => {
        vueContext.dispatch("handleNewParticipantEntered", msg);
      });
      this.state.channelInstances.voting.presence.subscribe("leave", (msg) => {
        vueContext.dispatch("handleExistingParticipantLeft", msg);
      });
    },

    handleNewParticipantEntered(vueContext, participant) {
      console.log("handleNewParticipantEntered", participant);
      vueContext.commit("addParticipantJoined", participant.clientId);
    },

    handleExistingParticipantLeft(vueContext, participant) {
      console.log("handleExistingParticipantLeft", participant);
      vueContext.commit("removeParticipantJoined", participant.clientId);
      let cardNumber = this.getters.selectedCardForClient(participant.clientId);
      if (cardNumber !== null) {
        vueContext.commit("removeParticipantVoted", {
          clientId: participant.clientId,
          cardNumber: cardNumber,
        });
      }
    },

    subscribeToAblyVoting(vueContext) {
      console.log("subscribeToAblyVoting");
      this.state.channelInstances.voting.subscribe("vote", (msg) => {
        vueContext.dispatch("handleVoteReceived", msg);
      });
      this.state.channelInstances.voting.subscribe("undo-vote", (msg) => {
        vueContext.dispatch("handleUndoVoteReceived", msg);
      });
      this.state.channelInstances.voting.subscribe("show-results", (msg) => {
        vueContext.dispatch("handleShowResultsReceived", msg);
      });
      this.state.channelInstances.voting.subscribe("reset-voting", (msg) => {
        vueContext.dispatch("handleResetVotingReceived", msg);
      });
    },

    handleVoteReceived(vueContext, msg) {
      console.log("handleVoteReceived", msg);
      vueContext.commit("addParticipantVoted", {
        clientId: msg.data.clientId,
        cardNumber: msg.data.cardNumber,
      });
    },

    handleUndoVoteReceived(vueContext, msg) {
      console.log("handleUndoVoteReceived", msg);
      vueContext.commit("removeParticipantVoted", {
        clientId: msg.data.clientId,
        cardNumber: msg.data.cardNumber,
      });
    },

    handleShowResultsReceived(vueContext, msg) {
      console.log("handleToggleVisibilityReceived", msg);
      if (msg.data.showResults) {
        vueContext.commit("setShowResults", true);
      } else {
        vueContext.commit("setShowResults", false);
      }
    },

    handleResetVotingReceived(vueContext, msg) {
      console.log("handleResetVotingReceived", msg);
      vueContext.dispatch("commonResetVoting");
    },

    startSession(vueContext, routeSessionId) {
      console.log("startSession - routeId", routeSessionId);
      let sessionId;
      if (routeSessionId == null) {
        sessionId = generateSessionId();
      } else {
        sessionId = routeSessionId;
      }
      vueContext.commit("setSessionId", sessionId);
    },

    resetVoting(vueContext) {
      vueContext.dispatch("commonResetVoting");
      vueContext.dispatch("publishResetVotingToAbly");
    },

    publishResetVotingToAbly({ state }) {
      state.channelInstances.voting.publish("reset-voting", {});
    },

    commonResetVoting(vueContext) {
      let flush = new Audio("flush.mp3");
      flush.play();
      vueContext.commit("resetCards");
      vueContext.commit("setShowResults", false);
    },

    closeAblyConnection() {
      console.log("closeAblyConnection");
      this.state.ablyRealtimeInstance.connection.close();
    },

    toggleShowResults(vueContext) {
      vueContext.commit("toggleShowResults");
      vueContext.dispatch(
        "publishShowResultsToAbly",
        this.getters.showResults
      );
    },

    publishShowResultsToAbly({ state }, showResults) {
      state.channelInstances.voting.publish("show-results", {
        showResults: showResults,
      });
    },

    doVote(vueContext, cardNumber) {
      console.log("doVote", cardNumber);
      let clientVote = {
        clientId: this.state.ablyClientId,
        cardNumber: cardNumber,
      };
      vueContext.commit("addParticipantVoted", clientVote);
      vueContext.dispatch("publishVoteToAbly", clientVote);
    },

    publishVoteToAbly({ state }, clientVote) {
      console.log("publishVoteToAbly", clientVote);
      state.channelInstances.voting.publish("vote", clientVote);
    },

    undoVote(vueContext, cardNumber) {
      let clientVote = {
        clientId: this.state.ablyClientId,
        cardNumber: cardNumber,
      };
      vueContext.commit("removeParticipantVoted",  clientVote);
      vueContext.dispatch("publishUndoVoteToAbly", clientVote);
    },

    publishUndoVoteToAbly({ state }, clientVote) {
      state.channelInstances.voting.publish("undo-vote", clientVote);
    },
  },
});
