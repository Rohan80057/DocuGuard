import React from 'react';
import { HistoryEvent } from '../types';

interface HistoryProps {
    events: HistoryEvent[];
}

const getIconForType = (type: HistoryEvent['type'])