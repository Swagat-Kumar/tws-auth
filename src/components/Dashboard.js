import React, { useState, useRef, useEffect } from "react";
import { Form, Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import firebase from "../firebase";

export default function Dashboard() {
	const dobRef = useRef();
	const placeRef = useRef();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [readOnly, setReadOnly] = useState(false);
	const { currentUser, logout } = useAuth();
	const history = useHistory();

	async function handleLogout() {
		setError("");

		try {
			await logout();
			history.push("/login");
		} catch {
			setError("Failed to log out");
		}
	}
	async function handleSubmit(e) {
		e.preventDefault();

		try {
			setError("");
			setLoading(true);
			const userDetails = firebase
				.database()
				.ref("user-details")
				.child(currentUser.uid);
			console.log(dobRef.current.value);
			console.log(placeRef.current.value);
			await userDetails.set({
				dob: dobRef.current.value,
				pob: placeRef.current.value,
			});
			history.push("/");
		} catch (err) {
			setError(
				"Failed to update User Details : " + JSON.stringify(err.message)
			);
		}

		setLoading(false);
		setReadOnly(true);
	}
	useEffect(() => {
		try {
			setError("");
			setLoading(true);
			const userDetails = firebase
				.database()
				.ref("user-details")
				.child(currentUser.uid);
			userDetails.on("value", snap => {
				console.log(snap.val());
				if (snap.val()) {
					dobRef.current.value = snap.val().dob;
					placeRef.current.value = snap.val().pob;
					setReadOnly(true);
				}
			});
		} catch (err) {
			setError(
				"Failed to fetch User Profile : " + JSON.stringify(err.message)
			);
		}
		setLoading(false);
	}, [currentUser.uid]);
	return (
		<>
			<Card>
				<Card.Body>
					<h2 className='text-center mb-4'>Profile</h2>
					{error && <Alert variant='danger'>{error}</Alert>}
					<strong>Email :</strong> {currentUser.email}
					<Form className='mt-2' onSubmit={handleSubmit}>
						<Form.Group id='dob'>
							<Form.Label>Date of Birth</Form.Label>
							<Form.Control
								ref={dobRef}
								required
								readOnly={readOnly}
							/>
						</Form.Group>
						<Form.Group id='place'>
							<Form.Label>Place of Birth</Form.Label>
							<Form.Control
								ref={placeRef}
								required
								readOnly={readOnly}
							/>
						</Form.Group>
						<Button
							disabled={loading || readOnly}
							className='w-100'
							type='submit'
						>
							Set Date of Birth and Place of Birth
						</Button>
					</Form>
				</Card.Body>
			</Card>

			<div className='w-100 text-center mt-2'>
				<Button variant='link' onClick={handleLogout}>
					Log Out
				</Button>
			</div>
		</>
	);
}
