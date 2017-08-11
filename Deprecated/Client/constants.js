const Accounting                = 'Accounting';
const Friendship                = 'Friendship';
const User                      = 'User';
const Friends                   = 'Friends';
const AllTransactions           = 'AllTransactions';
const Device                    = 'Device';
const Broker                    = 'Broker';
const Updates                    = 'Updates';

const AccountingStatusComputed  = 'Computed';
const AccountingStatusBlocked   = 'Blocked';
const AccountingStatusConfirmed = 'Confirmed';

const FriendshipStatusRequested     = 'Requested';
const FriendshipStatusConfirmed     = 'Confirmed';
const FriendshipStatusPending       = 'Pending';

const DeviceStatusActive            = "Active";
const DeviceStatusInactive          = "Inactive";

const CoinReq = 'CoinReq';

const Magic	= 12345;
const Version = 1;

const instanceStartMessage=0;
const instanceStopMessage=1;
const vmStartMessage=2;
const vmStopMessage=3;
const taskletStartMessage=4;
const taskletStopMessage=5;
const iRequestMessage=6;
const iResultMessage=7;
const iResendRequestMessage=8;
const iByteCodeRequestMessage=9;
const iCodeDebugMessage=10;
const guidMessage=11;
const tExecuteMessage=12;
const tResultMessage=13;
const tForwardMessage=14;
const mTvmStatusMessage=15;
const mTvmJoinMessage=16;
const mTvmRequestStatusMessage=17;
const mTvmTerminationMessage=18;
const bHeartbeatMessage=19;
const bIPMessage=20;
const bRequestMessage=21;
const bResponseMessage=22;
const vmUpMessage=23;
const vmDownMessage=24;
const tHeartBeatMessage=25;
const benchmarkMessage=26;
const dropTaskletMessageLocal=27;
const notdefined=28;
const tSnapshotMessage=29;
const mTvmCancelMessage=30;
const mTvmSnapshotRequestAndStopMessage=31;
const mTvmContinueMessage=32;
const mTvmPauseMessage=33;


module.exports = {
    Accounting: Accounting,
    Friendship: Friendship,
    User: User,
    Friends: Friends,
    AllTransactions: AllTransactions,
    CoinReq: CoinReq,
    Device:  Device,
    Broker:  Broker,
    Updates: Updates,

    AccountingStatusComputed: AccountingStatusComputed,
    AccountingStatusBlocked: AccountingStatusBlocked,
    AccountingStatusConfirmed: AccountingStatusConfirmed,

    FriendshipStatusRequested: FriendshipStatusRequested,
    FriendshipStatusConfirmed: FriendshipStatusConfirmed,
    FriendshipStatusPending: FriendshipStatusPending,

    DeviceStatusActive: DeviceStatusActive,
    DeviceStatusInactive: DeviceStatusInactive,

    Magic: Magic,
    Version: Version,
    bHeartbeatMessage: bHeartbeatMessage,
    bIPMessage: bIPMessage,
    benchmarkMessage: benchmarkMessage,
    vmUpMessage: vmUpMessage,
    vmDownMessage: vmDownMessage,
    bRequestMessage: bRequestMessage,
    bResponseMessage: bResponseMessage
};