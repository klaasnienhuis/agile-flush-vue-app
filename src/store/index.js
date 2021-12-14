import Vue from "vue";
import Vuex from "vuex";
import * as Ably from "ably";
import { generateName } from "../util/nameGenerator.js";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    ablyRealtimeInstance: null,
    isAblyConnected: false,
    ablyClientId: null,
    sessionId: null,
    participantsJoinedArr: [],
    participantsVotedDict: {},
    nrOfParticipantsVoted: 0,
    channelNames: {
      voting: "voting",
    },
    channelInstances: {
      voting: null,
    },
    showResults: false,
    isAnyCardSelected: false,
    cards: [
      {
        number: "0",
        count: 0,
        isSelected: false,
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
        count: 0,
        isSelected: false,
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
        count: 0,
        isSelected: false,
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
        count: 0,
        isSelected: false,
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
        count: 0,
        isSelected: false,
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
        count: 0,
        isSelected: false,
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
        count: 0,
        isSelected: false,
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
        count: 0,
        isSelected: false,
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
        count: 0,
        isSelected: false,
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
    getIsAblyConnectedStatus: (state) => state.isAblyConnected,
    getSessionId: (state) => state.sessionId,
    getSessionStarted: (state) =>
      state.sessionId !== null && state.sessionId !== undefined,
    getVotingChannel: (state) => state.channelInstances.voting,
    getNrOfParticipantsJoined: (state) => state.participantsJoinedArr.length,
    getHaveParticipantsJoined: (state) => state.participantsJoinedArr.length > 1,
    getNrOfParticipantsVoted: (state) => state.nrOfParticipantsVoted,
    getShowResults: (state) => state.showResults,
    getCards: (state) => state.cards,
    getSelectedCard: (state) => state.cards.filter((card) => card.isSelected)[0],
    getIsAnyCardSelected: (state) => state.isAnyCardSelected,
    getCardIndex: (state) => (cardNumber) => {
      return state.cards.findIndex((card) => card.number === cardNumber);
    },
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
      state.participantsVotedDict[clientVote.clientId] = clientVote.cardNumber;
      state.nrOfParticipantsVoted++;
    },
    removeParticipantVoted(state, clientId) {
      console.log("removeParticipantVoted", clientId);
      delete state.participantsVotedDict[clientId];
      if (state.nrOfParticipantsVoted > 0) {
        state.nrOfParticipantsVoted--;
      }
    },
    setNrOfParticipantsVoted(state, number) {
      state.nrOfParticipantsVoted = number;
    },
    setParticipantVotedDict(state, participantsVoted) {
      state.participantsVotedDict = participantsVoted;
    },
    toggleShowResults(state) {
      state.showResults = !state.showResults;
    },
    setShowResults(state, showResults) {
      state.showResults = showResults;
    },
    resetCards(state) {
      state.cards.forEach((card) => {
        card.count = 0;
        card.isSelected = false;
      });
      state.isAnyCardSelected = false;
    },
    setNrOfParticipantVoted(state, nrOfParticipantsVoted) {
      state.nrOfParticipantsVoted = nrOfParticipantsVoted;
    },
    selectCard(state, cardNumber) {
      let index = this.getters.getCardIndex(cardNumber);
      state.cards[index].isSelected = true;
      state.isAnyCardSelected = true;
    },
    incrementCardCount(state, cardNumber) {
      let index = this.getters.getCardIndex(cardNumber);
      state.cards[index].count++;
    },
    deselectCard(state, cardNumber) {
      let index = this.getters.getCardIndex(cardNumber);
      state.cards[index].isSelected = false;
      state.isAnyCardSelected = false;
    },
    decrementCardCount(state, cardNumber) {
      let index = this.getters.getCardIndex(cardNumber);
      if (state.cards[index].count > 0) {
        state.cards[index].count--;
      }
    },
  },

  actions: {
    instantiateAblyConnection(vueContext, sessionId = null) {
      if (!this.getters.getIsAblyConnectedStatus) {
        const ablyInstance = new Ably.Realtime({
          authUrl: "/api/createTokenRequest",
          echoMessages: false,
        });
        console.log("auth: ", ablyInstance.auth);
        ablyInstance.connection.once("connected", () => {
          vueContext.commit("setAblyConnectionStatus", true);
          vueContext.commit("setAblyRealtimeInstance", ablyInstance);
          vueContext.commit(
            "setAblyClientId",
            this.state.ablyRealtimeInstance.auth.clientId
          );
          if (sessionId) {
            vueContext.commit("setSessionId", sessionId);
          }
          vueContext.dispatch("attachToAblyChannels");
          vueContext.dispatch("getExistingAblyPresenceSet");
          vueContext.dispatch("subscribeToAblyPresence");
          vueContext.dispatch("enterClientInAblyPresenceSet");
        });
      }
    },

    attachToAblyChannels(vueContext) {
      const channelName = `${this.state.channelNames.voting}-${this.state.sessionId}`;
      console.log("channelName", channelName);
      const votingChannel = this.state.ablyRealtimeInstance.channels.get(
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

    getExistingAblyPresenceSet(vueContext) {
      this.state.channelInstances.voting.presence.get((err, participants) => {
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
      vueContext.commit("removeParticipantJoined", participant.clientId);
      console.log("clientId+Vote", participant.clientId, this.state.participantsVotedDict[participant.clientId]);
      if (this.state.participantsVotedDict[participant.clientId] !== undefined) {
        vueContext.commit("decrementCardCount", this.state.participantsVotedDict[participant.clientId]);
        vueContext.commit("removeParticipantVoted", participant.clientId);
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
        vueContext.dispatch("handleResetVotesReceived", msg);
      });
    },

    handleVoteReceived(vueContext, msg) {
      console.log("handleVoteReceived", msg);
      vueContext.commit("incrementCardCount", msg.data.cardNumber);
      vueContext.commit("addParticipantVoted", { "clientId": msg.clientId, "cardNumber": msg.data.cardNumber} );
    },

    handleUndoVoteReceived(vueContext, msg) {
      console.log("handleUndoVoteReceived", msg);
      vueContext.commit("decrementCardCount", msg.data.cardNumber);
      vueContext.commit("removeParticipantVoted", msg.clientId);
    },

    handleShowResultsReceived(vueContext, msg) {
      console.log("handleToggleVisibilityReceived", msg);
      if (msg.data.showResults) {
        vueContext.commit("setShowResults", true);
      } else {
        vueContext.commit("setShowResults", false);
      }
    },

    handleResetVotesReceived(vueContext, msg) {
      console.log("handleResetVotesReceived", msg);
      vueContext.dispatch("commonResetVoting");
    },

    startSession(vueContext, routeSessionId) {
      console.log("startSession - routeId", routeSessionId);
      let sessionId;
      if (routeSessionId == null) {
        sessionId = generateName();
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
      vueContext.commit("setNrOfParticipantsVoted", 0);
      vueContext.commit("setParticipantVotedDict", {});
    },

    closeAblyConnection() {
      console.log("closeAblyConnection");
      this.state.ablyRealtimeInstance.connection.close();
    },

    toggleShowResults(vueContext) {
      vueContext.commit("toggleShowResults");
      vueContext.dispatch("publishShowResultsToAbly", this.getters.getShowResults);
    },

    publishShowResultsToAbly({ state }, showResults) {
      state.channelInstances.voting.publish("show-results", {
        showResults: showResults,
      });
    },

    doVote(vueContext, cardNumber) {
      console.log("doVote", cardNumber);
      vueContext.commit("selectCard", cardNumber);
      vueContext.commit("incrementCardCount", cardNumber);
      vueContext.commit("addParticipantVoted", { "clientId": this.state.ablyClientId, "cardNumber": cardNumber });
      vueContext.dispatch("publishVoteToAbly", cardNumber);
    },

    publishVoteToAbly({ state }, cardNumber) {
      console.log("publishVoteToAbly", cardNumber);
      state.channelInstances.voting.publish("vote", {
        id: state.ablyClientId,
        cardNumber: cardNumber,
      });
    },

    undoVote(vueContext, cardNumber) {
      vueContext.commit("deselectCard", cardNumber);
      vueContext.commit("decrementCardCount", cardNumber);
      vueContext.commit("removeParticipantVoted", this.state.ablyClientId);
      vueContext.dispatch("publishUndoVoteToAbly", cardNumber);
    },

    publishUndoVoteToAbly({ state }, cardNumber) {
      state.channelInstances.voting.publish("undo-vote", {
        id: state.ablyClientId,
        cardNumber: cardNumber,
      });
    },
  },
});
